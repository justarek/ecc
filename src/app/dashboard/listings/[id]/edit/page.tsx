import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateListingAction } from "@/app/actions/listings";
import ListingForm from "@/components/ListingForm";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: PageProps<"/dashboard/listings/[id]/edit">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/dashboard/listings/${id}/edit`);
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!listing) notFound();
  if (listing.userId !== user.id && user.role !== "ADMIN") notFound();

  const boundAction = updateListingAction.bind(null, listing.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Edit listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Changes to an approved listing will be re-reviewed before going live again.
      </p>

      <div className="mt-8">
        <ListingForm
          action={boundAction}
          submitLabel="Save changes"
          existingImages={listing.images}
          initialValues={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            propertyType: listing.propertyType,
            purpose: listing.purpose,
            price: listing.price,
            currency: listing.currency,
            area: listing.area,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            floor: listing.floor,
            city: listing.city,
            district: listing.district,
            compound: listing.compound,
            address: listing.address,
            amenities: listing.amenities ? listing.amenities.split(",") : [],
          }}
        />
      </div>
    </div>
  );
}
