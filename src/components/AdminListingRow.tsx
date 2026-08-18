"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { setListingStatusAction, toggleFeaturedAction } from "@/app/actions/admin";
import { cityLabel, formatPrice, propertyTypeLabel } from "@/lib/constants";
import StatusBadge from "./StatusBadge";
import type { ListingCardData } from "@/lib/listings";

export default function AdminListingRow({ listing }: { listing: ListingCardData }) {
  const [isPending, startTransition] = useTransition();
  const image = listing.images[0]?.url;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="112px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No photo
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/listings/${listing.id}`} className="font-semibold text-foreground hover:text-primary">
            {listing.title}
          </Link>
          <StatusBadge status={listing.status} />
          {listing.featured && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Featured
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {propertyTypeLabel(listing.propertyType)} · {cityLabel(listing.city)} ·{" "}
          {formatPrice(listing.price, listing.currency)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {listing.status !== "APPROVED" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => setListingStatusAction(listing.id, "APPROVED"))}
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {listing.status !== "REJECTED" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => setListingStatusAction(listing.id, "REJECTED"))}
            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleFeaturedAction(listing.id, !listing.featured))}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted disabled:opacity-60"
        >
          {listing.featured ? "Unfeature" : "Feature"}
        </button>
      </div>
    </div>
  );
}
