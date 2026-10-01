"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/i18n/config";
import { buildListingVideoParams } from "@/lib/listing-video";
import {
  MPT_TASK_COMPLETE,
  MPT_TASK_FAILED,
  MoneyPrinterError,
  createVideoTask,
  deleteVideoTask,
  downloadTaskVideo,
  getVideoTask,
  isMoneyPrinterConfigured,
} from "@/lib/moneyprinter";
import { deleteUploadedImage, saveVideoBuffer } from "@/lib/storage";

export type ListingVideoState = {
  status: string | null;
  progress: number;
  videoUrl: string | null;
  error: string | null;
  // True when the status check itself failed (e.g. MoneyPrinterTurbo is
  // briefly unreachable); the task is still assumed to be running.
  transientError?: boolean;
};

async function getOwnedListing(listingId: string) {
  const user = await requireUser();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.userId !== user.id && user.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }
  return listing;
}

function toState(listing: {
  videoStatus: string | null;
  videoProgress: number;
  videoUrl: string | null;
  videoError: string | null;
}): ListingVideoState {
  return {
    status: listing.videoStatus,
    progress: listing.videoProgress,
    videoUrl: listing.videoUrl,
    error: listing.videoError,
  };
}

function errorMessage(e: unknown) {
  return (e instanceof Error ? e.message : String(e)).slice(0, 500);
}

export async function generateListingVideoAction(listingId: string): Promise<ListingVideoState> {
  const listing = await getOwnedListing(listingId);
  if (!isMoneyPrinterConfigured()) {
    return { ...toState(listing), error: "Video generation is not configured on this server." };
  }
  if (listing.videoStatus === "PROCESSING") return toState(listing);

  const locale = await getLocale();
  let taskId: string;
  try {
    const params = await buildListingVideoParams(listing, isLocale(locale) ? locale : "en");
    taskId = await createVideoTask(params);
  } catch (e) {
    return { ...toState(listing), error: errorMessage(e) };
  }

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { videoStatus: "PROCESSING", videoTaskId: taskId, videoProgress: 0, videoError: null },
  });

  revalidatePath(`/listings/${listingId}`);
  return toState(updated);
}

/**
 * Polls MoneyPrinterTurbo for the listing's current video task. When the task
 * has finished, the video is copied into this app's own storage (so it keeps
 * working after the MoneyPrinterTurbo server cleans up or requires an API key)
 * and the task is deleted from MoneyPrinterTurbo.
 */
export async function refreshListingVideoAction(listingId: string): Promise<ListingVideoState> {
  const listing = await getOwnedListing(listingId);
  const taskId = listing.videoTaskId;
  if (listing.videoStatus !== "PROCESSING" || !taskId) return toState(listing);

  // Only updates the listing if it is still waiting on this same task, so a
  // concurrent poll or a newer generation request isn't overwritten.
  const updateIfCurrent = (data: Parameters<typeof prisma.listing.updateMany>[0]["data"]) =>
    prisma.listing.updateMany({
      where: { id: listingId, videoTaskId: taskId, videoStatus: "PROCESSING" },
      data,
    });

  try {
    const task = await getVideoTask(taskId);

    if (task.state === MPT_TASK_FAILED || (task.state === MPT_TASK_COMPLETE && task.videos.length === 0)) {
      await updateIfCurrent({ videoStatus: "FAILED", videoError: task.error || "Video generation failed." });
    } else if (task.state === MPT_TASK_COMPLETE) {
      const { buffer, contentType } = await downloadTaskVideo(task.videos[0]);
      const videoUrl = await saveVideoBuffer(buffer, contentType);
      const { count } = await updateIfCurrent({
        videoStatus: "READY",
        videoProgress: 100,
        videoUrl,
        videoError: null,
      });

      if (count === 0) {
        await deleteUploadedImage(videoUrl);
      } else {
        if (listing.videoUrl) await deleteUploadedImage(listing.videoUrl);
        await deleteVideoTask(taskId);
        revalidatePath(`/listings/${listingId}`);
      }
    } else if (task.progress !== listing.videoProgress) {
      await updateIfCurrent({ videoProgress: task.progress });
    }
  } catch (e) {
    // MoneyPrinterTurbo keeps tasks in memory by default, so a restart loses
    // them; anything other than a 404 is treated as temporary.
    if (e instanceof MoneyPrinterError && e.status === 404) {
      await updateIfCurrent({ videoStatus: "FAILED", videoError: "The video task no longer exists." });
    } else {
      return { ...toState(listing), error: errorMessage(e), transientError: true };
    }
  }

  const fresh = await prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
  return toState(fresh);
}
