import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { createListingAction } from "@/app/actions/listings";
import ListingForm from "@/components/ListingForm";

export const metadata: Metadata = { title: "Post a listing" };

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/listings/new");
  }

  const t = await getTranslations("postListing");
  const tForm = await getTranslations("listingForm");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8">
        <ListingForm action={createListingAction} submitLabel={tForm("submitForReview")} />
      </div>
    </div>
  );
}
