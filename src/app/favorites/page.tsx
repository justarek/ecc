import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/favorites");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });

  const listings = favorites.map((f) => f.listing).filter((l) => l.status === "APPROVED");
  const t = await getTranslations("favorites");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Link
            href="/listings"
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            {t("browse")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorited isLoggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
