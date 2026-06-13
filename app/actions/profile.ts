"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin";
import { setProfileImageUrl } from "@/lib/db/site-settings";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type UploadProfileImageResult =
  | { ok: true }
  | { ok: false; error: string };

export async function uploadProfileImage(
  formData: FormData,
): Promise<UploadProfileImageResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload" };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP image" };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 2 MB or smaller" };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

    await setProfileImageUrl(dataUrl);
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    console.error("uploadProfileImage failed:", error);
    return { ok: false, error: "Failed to upload image" };
  }
}
