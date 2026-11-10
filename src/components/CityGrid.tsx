import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CITIES } from "@/lib/constants";

const GRADIENTS = [
  "from-amber-200 to-amber-400",
  "from-emerald-200 to-emerald-400",
  "from-sky-200 to-sky-400",
  "from-rose-200 to-rose-400",
  "from-violet-200 to-violet-400",
  "from-orange-200 to-orange-400",
];

export default function CityGrid({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {CITIES.map((city, i) => {
        const primary = locale === "ar" ? city.nameAr : city.name;
        const secondary = locale === "ar" ? city.name : city.nameAr;
        return (
          <Link
            key={city.slug}
            href={`/listings?city=${city.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
          >
            <div
              className={`h-20 w-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} transition-transform group-hover:scale-105`}
            />
            <div className="p-3">
              <p className="text-sm font-semibold text-foreground">{primary}</p>
              <p
                className="text-xs text-muted-foreground"
                dir={locale === "ar" ? "ltr" : "rtl"}
              >
                {secondary}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("listings", { count: counts[city.slug] ?? 0 })}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
