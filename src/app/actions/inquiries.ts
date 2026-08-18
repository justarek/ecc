"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";

export type InquiryActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function sendInquiryAction(
  _prevState: InquiryActionState,
  formData: FormData
): Promise<InquiryActionState> {
  const listingId = formData.get("listingId");
  if (typeof listingId !== "string" || !listingId) {
    return { error: "Missing listing." };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return { error: "This listing no longer exists." };
  }

  const user = await getCurrentUser();

  await prisma.inquiry.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      listingId,
      userId: user?.id,
    },
  });

  return { success: true };
}
