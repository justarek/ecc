import Link from "next/link";
import Image from "next/image";
import type { ListingCardData } from "@/lib/listings";
import { cityLabel, formatArea, formatPrice, propertyTypeLabel } from "@/lib/constants";
import FavoriteButton from "./FavoriteButton";

export default function ListingCard({
  listing,
  isFavorited = false,
  isLoggedIn = false,
}: {
  listing: ListingCardData;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}) {
  const image = listing.images[0]?.url;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No photo
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {listing.purpose === "SALE" ? "For Sale" : "For Rent"}
          </span>
          {listing.featured && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              Featured
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton
            listingId={listing.id}
            initialFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-lg font-bold text-foreground">
          {formatPrice(listing.price, listing.currency)}
          {listing.purpose === "RENT" && (
            <span className="text-sm font-normal text-muted-foreground"> /month</span>
          )}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium text-foreground/90">{listing.title}</h3>
        <p className="text-xs text-muted-foreground">
          {propertyTypeLabel(listing.propertyType)} · {cityLabel(listing.city)}
        </p>

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{formatArea(listing.area)}</span>
          {listing.bedrooms !== null && listing.bedrooms !== undefined && (
            <span>{listing.bedrooms} bed</span>
          )}
          {listing.bathrooms !== null && listing.bathrooms !== undefined && (
            <span>{listing.bathrooms} bath</span>
          )}
        </div>
      </div>
    </Link>
  );
}
