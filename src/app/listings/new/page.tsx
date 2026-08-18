import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createListingAction } from "@/app/actions/listings";
import ListingForm from "@/components/ListingForm";

export const metadata: Metadata = { title: "Post a listing" };

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/listings/new");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Post a listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        List a unit or a plot of land for sale or rent. Listings are reviewed before they
        appear publicly.
      </p>

      <div className="mt-8">
        <ListingForm action={createListingAction} submitLabel="Submit for review" />
      </div>
    </div>
  );
}
