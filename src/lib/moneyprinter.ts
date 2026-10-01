import "server-only";

/**
 * Minimal client for a self-hosted MoneyPrinterTurbo API server
 * (https://github.com/harry0703/MoneyPrinterTurbo), used to render short
 * promo videos for listings from a script + stock footage keywords.
 *
 * Configure with MONEYPRINTER_API_URL (e.g. http://localhost:8080) and, if
 * the server sets `api_key` in its config.toml, MONEYPRINTER_API_KEY.
 */

// Task states reported by MoneyPrinterTurbo (app/models/const.py).
export const MPT_TASK_FAILED = -1;
export const MPT_TASK_COMPLETE = 1;
export const MPT_TASK_PROCESSING = 4;

const REQUEST_TIMEOUT_MS = 15_000;
const DOWNLOAD_TIMEOUT_MS = 5 * 60_000;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export type VideoAspect = "9:16" | "16:9" | "1:1";

export type CreateVideoParams = {
  video_subject: string;
  video_script: string;
  video_terms: string[];
  video_language: string;
  voice_name: string;
  video_aspect: VideoAspect;
  subtitle_enabled: boolean;
  font_name?: string;
  video_source?: string;
  video_clip_duration?: number;
  video_count?: number;
  bgm_type?: string;
};

export type VideoTask = {
  state: number;
  progress: number;
  videos: string[];
  error: string | null;
};

export class MoneyPrinterError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "MoneyPrinterError";
  }
}

export function isMoneyPrinterConfigured() {
  return Boolean(process.env.MONEYPRINTER_API_URL);
}

function baseUrl() {
  const url = process.env.MONEYPRINTER_API_URL;
  if (!url) throw new MoneyPrinterError("MONEYPRINTER_API_URL is not set");
  return url.replace(/\/+$/, "");
}

function authHeaders(): Record<string, string> {
  const key = process.env.MONEYPRINTER_API_KEY;
  return key ? { "x-api-key": key } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    throw new MoneyPrinterError(`Could not reach MoneyPrinterTurbo: ${e instanceof Error ? e.message : e}`);
  }

  // Responses are wrapped as { status, message?, data? }, including errors.
  const body = (await res.json().catch(() => null)) as { message?: string; data?: T } | null;
  if (!res.ok) {
    throw new MoneyPrinterError(body?.message || `MoneyPrinterTurbo returned HTTP ${res.status}`, res.status);
  }
  return body?.data as T;
}

/** Queues a video generation task and returns its task id. */
export async function createVideoTask(params: CreateVideoParams): Promise<string> {
  const data = await request<{ task_id?: string }>("/api/v1/videos", {
    method: "POST",
    body: JSON.stringify({
      video_source: "pexels",
      video_clip_duration: 4,
      video_count: 1,
      bgm_type: "random",
      ...params,
    }),
  });
  if (!data?.task_id) throw new MoneyPrinterError("MoneyPrinterTurbo did not return a task id");
  return data.task_id;
}

export async function getVideoTask(taskId: string): Promise<VideoTask> {
  const data = await request<{
    state?: number;
    progress?: number;
    videos?: string[];
    combined_videos?: string[];
    error?: string | null;
  }>(`/api/v1/tasks/${encodeURIComponent(taskId)}`);

  return {
    state: data?.state ?? MPT_TASK_PROCESSING,
    progress: Math.max(0, Math.min(100, Math.round(data?.progress ?? 0))),
    videos: data?.videos?.length ? data.videos : (data?.combined_videos ?? []),
    error: data?.error ?? null,
  };
}

/** Best-effort cleanup of a task's files on the MoneyPrinterTurbo server. */
export async function deleteVideoTask(taskId: string) {
  await request(`/api/v1/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" }).catch(() => {});
}

/**
 * Downloads a finished task's video. Task file URLs are either relative
 * (`/tasks/...`) or absolute when the server sets `endpoint` in its config;
 * the API key is only sent to the configured MoneyPrinterTurbo origin.
 */
export async function downloadTaskVideo(fileUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  const base = new URL(baseUrl());
  const url = new URL(fileUrl, base);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new MoneyPrinterError("Unsupported video URL returned by MoneyPrinterTurbo");
  }

  const res = await fetch(url, {
    headers: url.origin === base.origin ? authHeaders() : {},
    cache: "no-store",
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  }).catch((e) => {
    throw new MoneyPrinterError(`Failed to download video: ${e instanceof Error ? e.message : e}`);
  });
  if (!res.ok) throw new MoneyPrinterError(`Failed to download video (HTTP ${res.status})`, res.status);

  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_VIDEO_BYTES) throw new MoneyPrinterError("Generated video is too large");

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_VIDEO_BYTES) throw new MoneyPrinterError("Generated video is too large");

  const contentType = res.headers.get("content-type")?.split(";")[0] || "video/mp4";
  return { buffer, contentType: contentType.startsWith("video/") ? contentType : "video/mp4" };
}
