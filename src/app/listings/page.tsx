import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseSearchParams, searchListings } from "@/lib/listings";
import { cityLabel } from "@/lib/constants";
import FilterSidebar from "@/components/FilterSidebar";
import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";
import SortSelect from "@/components/SortSelect";

export const metadata: Metadata = { title: "Browse listings" };

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const sp = await searchParams;
  const { filters, page } = parseSearchParams(sp);

  const [user, { listings, total, pageCount }] = await Promise.all([
    getCurrentUser(),
    searchListings(filters, page),
  ]);

  const favorites = user
    ? await prisma.favorite.findMany({ where: { userId: user.id }, select: { listingId: true } })
    : [];
  const favoriteIds = new Set(favorites.map((f) => f.listingId));

  const heading = filters.city
    ? `Properties in ${cityLabel(filters.city)}`
    : "All listings";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
          <FilterSidebar filters={filters} />
        </aside>

        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{heading}</h1>
              <p className="text-sm text-muted-foreground">{total} results</p>
            </div>
            <SortSelect current={filters.sort} />
          </div>

          {listings.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No listings match your filters. Try broadening your search.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favoriteIds.has(listing.id)}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          )}

          <Pagination basePath="/listings" searchParams={sp} page={page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}
