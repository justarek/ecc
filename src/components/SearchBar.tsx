import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES, CITIES, PURPOSES } from "@/lib/constants";

export default function SearchBar() {
  const t = useTranslations("search");
  const tOptions = useTranslations("options");
  const locale = useLocale();

  return (
    <form
      action="/listings"
      className="flex w-full flex-col gap-3 rounded-2xl bg-surface p-4 shadow-xl sm:flex-row sm:items-end sm:gap-2 sm:p-3"
    >
      <div className="flex-1">
        <label htmlFor="q" className="mb-1 block text-xs font-semibold text-muted-foreground">
          {t("search")}
        </label>
        <input
          id="q"
          name="q"
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="sm:w-40">
        <label htmlFor="purpose" className="mb-1 block text-xs font-semibold text-muted-foreground">
          {t("purpose")}
        </label>
        <select
          id="purpose"
          name="purpose"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">{t("saleOrRent")}</option>
          {PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {tOptions(`purpose.${p.value}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-40">
        <label htmlFor="category" className="mb-1 block text-xs font-semibold text-muted-foreground">
          {t("type")}
        </label>
        <select
          id="category"
          name="category"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">{t("unitsOrLand")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {tOptions(`category.${c.value}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-48">
        <label htmlFor="city" className="mb-1 block text-xs font-semibold text-muted-foreground">
          {t("city")}
        </label>
        <select
          id="city"
          name="city"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">{t("allNewCities")}</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {locale === "ar" ? c.nameAr : c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
