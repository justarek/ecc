import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cityLabel, formatArea, formatPrice, propertyTypeLabel } from "@/lib/constants";
import ImageGallery from "@/components/ImageGallery";
import FavoriteButton from "@/components/FavoriteButton";
import InquiryForm from "@/components/InquiryForm";
import ListingCard from "@/components/ListingCard";

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
    },
  });
  return listing;
}

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
  };
}

export default async function ListingDetailPage({ params }: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getCurrentUser()]);

  if (!listing) notFound();

  const isOwner = user?.id === listing.userId;
  const isAdmin = user?.role === "ADMIN";

  if (listing.status !== "APPROVED" && !isOwner && !isAdmin) {
    notFound();
  }

  after(async () => {
    await prisma.listing
      .update({ where: { id: listing.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  });

  const [favorite, similar] = await Promise.all([
    user
      ? prisma.favorite.findUnique({
          where: { userId_listingId: { userId: user.id, listingId: listing.id } },
        })
      : null,
    prisma.listing.findMany({
      where: {
        status: "APPROVED",
        city: listing.city,
        category: listing.category,
        id: { not: listing.id },
      },
      take: 3,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);

  const amenities = listing.amenities ? listing.amenities.split(",").filter(Boolean) : [];

  const details: { label: string; value: string }[] = [
    { label: "Property type", value: propertyTypeLabel(listing.propertyType) },
    { label: "Purpose", value: listing.purpose === "SALE" ? "For sale" : "For rent" },
    { label: "Area", value: formatArea(listing.area) },
  ];
  if (listing.bedrooms !== null) details.push({ label: "Bedrooms", value: String(listing.bedrooms) });
  if (listing.bathrooms !== null) details.push({ label: "Bathrooms", value: String(listing.bathrooms) });
  if (listing.floor !== null) details.push({ label: "Floor", value: String(listing.floor) });
  if (listing.compound) details.push({ label: "Compound", value: listing.compound });
  details.push({ label: "City", value: cityLabel(listing.city) });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {listing.status !== "APPROVED" && (isOwner || isAdmin) && (
        <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This listing is <strong>{listing.status.toLowerCase()}</strong> and is only visible to
          you{isAdmin && !isOwner ? " as an admin" : ""}. It won&apos;t appear in public search until
          approved.
        </div>
      )}

      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/listings" className="hover:text-primary">
          Listings
        </Link>{" "}
        / <span>{cityLabel(listing.city)}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {listing.district ? `${listing.district}, ` : ""}
                {cityLabel(listing.city)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(listing.price, listing.currency)}
                {listing.purpose === "RENT" && (
                  <span className="text-sm font-normal text-muted-foreground"> /month</span>
                )}
              </p>
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={!!favorite}
                isLoggedIn={!!user}
                variant="full"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{d.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {listing.description}
            </p>
          </div>

          {amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-foreground">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/80"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs text-muted-foreground">Listed by</p>
              <p className="mt-1 font-semibold text-foreground">{listing.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {listing.user.role === "AGENT" ? "Real estate agent" : "Property owner"}
              </p>
              {listing.user.phone && (
                <a
                  href={`tel:${listing.user.phone}`}
                  className="mt-3 flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  Call {listing.user.phone}
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-foreground">Send a message</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Get in touch about this property.
              </p>
              <div className="mt-4">
                <InquiryForm listingId={listing.id} user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold text-foreground">Similar listings nearby</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <ListingCard key={s.id} listing={s} isLoggedIn={!!user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
