"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function setListingStatusAction(listingId: string, status: "APPROVED" | "REJECTED") {
  await requireAdmin();

  await prisma.listing.update({ where: { id: listingId }, data: { status } });

  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
}

export async function toggleFeaturedAction(listingId: string, featured: boolean) {
  await requireAdmin();

  await prisma.listing.update({ where: { id: listingId }, data: { featured } });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/listings");
}
