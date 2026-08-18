import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const UPLOAD_PREFIX = "uploads";
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", UPLOAD_PREFIX);

type S3Config = {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  publicUrlBase: string;
};

function getS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) return null;

  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
  const publicUrlBase =
    process.env.S3_PUBLIC_URL_BASE ||
    (endpoint
      ? `${endpoint.replace(/\/$/, "")}/${bucket}`
      : `https://${bucket}.s3.${region}.amazonaws.com`);

  return { bucket, region, endpoint, forcePathStyle, publicUrlBase: publicUrlBase.replace(/\/$/, "") };
}

let cachedClient: S3Client | null = null;

function getS3Client() {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}

export function isObjectStorageConfigured() {
  return getS3Config() !== null;
}

function extensionFor(mimeType: string) {
  const sub = mimeType.split("/")[1] ?? "jpg";
  return sub === "jpeg" ? "jpg" : sub;
}

function validate(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Each image must be smaller than 8MB.");
  }
}

/**
 * Saves uploaded images to S3-compatible object storage when S3_* env vars
 * are configured, otherwise falls back to the local /public/uploads disk
 * (convenient for local development without cloud credentials). Returns the
 * public URLs to store on the Image model.
 */
export async function saveUploadedImages(files: File[]): Promise<string[]> {
  const valid = files.filter((f) => f.size > 0);
  if (valid.length === 0) return [];
  valid.forEach(validate);

  const s3Config = getS3Config();

  if (s3Config) {
    const client = getS3Client();
    const urls: string[] = [];
    for (const file of valid) {
      const key = `${UPLOAD_PREFIX}/${randomUUID()}.${extensionFor(file.type)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await client.send(
        new PutObjectCommand({
          Bucket: s3Config.bucket,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );
      urls.push(`${s3Config.publicUrlBase}/${key}`);
    }
    return urls;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const file of valid) {
    const filename = `${randomUUID()}.${extensionFor(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
    urls.push(`/${UPLOAD_PREFIX}/${filename}`);
  }
  return urls;
}

/** Deletes a previously-uploaded image, given the public URL stored on the Image model. */
export async function deleteUploadedImage(url: string): Promise<void> {
  const s3Config = getS3Config();

  if (s3Config && url.startsWith(s3Config.publicUrlBase)) {
    const key = url.slice(s3Config.publicUrlBase.length + 1);
    await getS3Client()
      .send(new DeleteObjectCommand({ Bucket: s3Config.bucket, Key: key }))
      .catch(() => {});
    return;
  }

  if (url.startsWith(`/${UPLOAD_PREFIX}/`)) {
    const filename = url.slice(`/${UPLOAD_PREFIX}/`.length);
    await unlink(path.join(LOCAL_UPLOAD_DIR, filename)).catch(() => {});
  }
}
