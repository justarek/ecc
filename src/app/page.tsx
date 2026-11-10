import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import SearchBar from "@/components/SearchBar";
import CityGrid from "@/components/CityGrid";
import ListingCard from "@/components/ListingCard";

export default async function Home() {
  const user = await getCurrentUser();
  const t = await getTranslations("home");

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
            {t("kicker")}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{t("subtitle")}</p>

          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{t("browseByCity")}</h2>
        </div>
        <div className="mt-6">
          <CityGrid counts={counts} />
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-surface-muted py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{t("featuredListings")}</h2>
              <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
                {t("viewAll")}
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
          <h2 className="text-xl font-bold text-foreground">{t("newestListings")}</h2>
          <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
            {t("viewAll")}
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
            {t.rich("noListingsYet", {
              link: (chunks) => (
                <Link href="/listings/new" className="text-primary hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </section>

      <section className="border-t border-border bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t("ctaSubtitle")}
          </p>
          <Link
            href="/listings/new"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}
