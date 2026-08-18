"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { listingSchema } from "@/lib/validation";
import { deleteUploadedImage, saveUploadedImages } from "@/lib/storage";

export type ListingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

function parseListingFormData(formData: FormData) {
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    propertyType: formData.get("propertyType"),
    purpose: formData.get("purpose"),
    price: formData.get("price"),
    currency: formData.get("currency") || "EGP",
    area: formData.get("area"),
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    floor: formData.get("floor") || undefined,
    city: formData.get("city"),
    district: formData.get("district") || "",
    compound: formData.get("compound") || "",
    address: formData.get("address") || "",
    amenities: formData.getAll("amenities").map(String),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
  });
}

export async function createListingAction(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to post a listing." };
  }

  const parsed = parseListingFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);

  let imageUrls: string[];
  try {
    imageUrls = await saveUploadedImages(imageFiles);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to upload images." };
  }

  const { amenities, district, compound, address, ...data } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      ...data,
      district: district || null,
      compound: compound || null,
      address: address || null,
      amenities,
      userId: user.id,
      images: { create: imageUrls.map((url, position) => ({ url, position })) },
    },
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(
  listingId: string,
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser();

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || (existing.userId !== user.id && user.role !== "ADMIN")) {
    return { error: "You don't have permission to edit this listing." };
  }

  const parsed = parseListingFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);

  let imageUrls: string[] = [];
  try {
    imageUrls = await saveUploadedImages(imageFiles);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to upload images." };
  }

  const { amenities, district, compound, address, ...data } = parsed.data;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...data,
      district: district || null,
      compound: compound || null,
      address: address || null,
      amenities,
      status: user.role === "ADMIN" ? undefined : "PENDING",
      ...(imageUrls.length > 0
        ? {
            images: {
              create: imageUrls.map((url, position) => ({
                url,
                position: position + 1000,
              })),
            },
          }
        : {}),
    },
  });

  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
  redirect(`/listings/${listingId}`);
}

export async function deleteListingAction(listingId: string) {
  const user = await requireUser();

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });
  if (!existing || (existing.userId !== user.id && user.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }

  await prisma.listing.delete({ where: { id: listingId } });
  await Promise.all(existing.images.map((img) => deleteUploadedImage(img.url)));

  revalidatePath("/listings");
  revalidatePath("/dashboard");
}

export async function deleteListingImageAction(imageId: string) {
  const user = await requireUser();

  const image = await prisma.image.findUnique({ where: { id: imageId }, include: { listing: true } });
  if (!image || (image.listing.userId !== user.id && user.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }

  await prisma.image.delete({ where: { id: imageId } });
  await deleteUploadedImage(image.url);
  revalidatePath(`/listings/${image.listingId}`);
}
