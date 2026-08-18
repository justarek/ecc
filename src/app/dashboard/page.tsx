import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cityLabel, formatPrice, propertyTypeLabel } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import DeleteListingButton from "@/components/DeleteListingButton";

export const metadata: Metadata = { title: "My dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard");

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { favorites: true, inquiries: true } } },
  });

  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "APPROVED").length,
    pending: listings.filter((l) => l.status === "PENDING").length,
    views: listings.reduce((sum, l) => sum + l.views, 0),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name.split(" ")[0]}.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          + Post a listing
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total listings", value: stats.total },
          { label: "Approved", value: stats.approved },
          { label: "Pending review", value: stats.pending },
          { label: "Total views", value: stats.views },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">My listings</h2>
          <Link href="/favorites" className="text-sm font-medium text-primary hover:underline">
            View favorites
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t posted any listings yet.
            </p>
            <Link
              href="/listings/new"
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
            >
              Post your first listing
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {listings.map((listing) => {
              const image = listing.images[0]?.url;
              return (
                <div
                  key={listing.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
                >
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
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {listing.title}
                      </Link>
                      <StatusBadge status={listing.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {propertyTypeLabel(listing.propertyType)} · {cityLabel(listing.city)} ·{" "}
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {listing.views} views · {listing._count.favorites} saves ·{" "}
                      {listing._count.inquiries} inquiries
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteListingButton listingId={listing.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
