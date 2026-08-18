import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import SearchBar from "@/components/SearchBar";
import CityGrid from "@/components/CityGrid";
import ListingCard from "@/components/ListingCard";

export default async function Home() {
  const user = await getCurrentUser();

  const [featured, recent, cityGroups, favorites] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "APPROVED", featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.listing.groupBy({
      by: ["city"],
      where: { status: "APPROVED" },
      _count: { city: true },
    }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { listingId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.listingId));
  const counts = Object.fromEntries(cityGroups.map((g) => [g.city, g._count.city]));

  return (
    <div>
      <section className="relative overflow-hidden bg-accent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Egypt&apos;s new cities, one platform
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Find your next home or plot of land in Egypt&apos;s new cities
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Browse verified units and land for sale or rent across New Cairo, the New
            Administrative Capital, 6th of October, Sheikh Zayed, and more.
          </p>

          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Browse by new city</h2>
        </div>
        <div className="mt-6">
          <CityGrid counts={counts} />
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-surface-muted py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Featured listings</h2>
              <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favoriteIds.has(listing.id)}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Newest listings</h2>
          <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorited={favoriteIds.has(listing.id)}
              isLoggedIn={!!user}
            />
          ))}
        </div>
        {recent.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            No listings yet. Be the first to{" "}
            <Link href="/listings/new" className="text-primary hover:underline">
              post a property
            </Link>
            .
          </p>
        )}
      </section>

      <section className="border-t border-border bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground">
            Selling a unit or a plot of land?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            List your property for free and reach thousands of buyers and tenants looking
            in Egypt&apos;s new cities.
          </p>
          <Link
            href="/listings/new"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            Post your listing
          </Link>
        </div>
      </section>
    </div>
  );
}
