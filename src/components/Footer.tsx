import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CITIES } from "@/lib/constants";

export default function Footer() {
  const featuredCities = CITIES.slice(0, 6);
  const locale = useLocale();
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                D
              </span>
              <span className="text-base font-bold text-foreground">
                Dar<span className="text-primary">Masr</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("explore")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/listings?category=UNIT" className="hover:text-primary">
                  {t("unitsForSale")}
                </Link>
              </li>
              <li>
                <Link href="/listings?category=LAND" className="hover:text-primary">
                  {t("landForSale")}
                </Link>
              </li>
              <li>
                <Link href="/listings?purpose=RENT" className="hover:text-primary">
                  {t("propertiesForRent")}
                </Link>
              </li>
              <li>
                <Link href="/listings/new" className="hover:text-primary">
                  {t("postListing")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("newCities")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {featuredCities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/listings?city=${city.slug}`} className="hover:text-primary">
                    {locale === "ar" ? city.nameAr : city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("account")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-primary">
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  {t("createAccount")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  {t("myDashboard")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t("allRightsReserved", { year: new Date().getFullYear() })}</p>
          <p>{t("builtFor")}</p>
        </div>
      </div>
    </footer>
  );
}
