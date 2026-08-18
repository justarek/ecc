import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES, CITIES, PROPERTY_TYPES, PURPOSES } from "@/lib/constants";
import type { ListingFilters } from "@/lib/listings";

export default function FilterSidebar({ filters }: { filters: ListingFilters }) {
  const t = useTranslations("filters");
  const tOptions = useTranslations("options");
  const locale = useLocale();

  const propertyTypes = filters.category
    ? PROPERTY_TYPES.filter((t) => t.category === filters.category)
    : PROPERTY_TYPES;

  return (
    <form
      action="/listings"
      method="get"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5"
    >
      {filters.q && <input type="hidden" name="q" value={filters.q} />}

      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("purpose")}</h3>
        <div className="mt-2 flex gap-2">
          {PURPOSES.map((p) => (
            <label
              key={p.value}
              className="flex-1 cursor-pointer rounded-lg border border-border px-3 py-2 text-center text-xs font-medium has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary"
            >
              <input
                type="radio"
                name="purpose"
                value={p.value}
                defaultChecked={filters.purpose === p.value}
                className="sr-only"
              />
              {tOptions(`purpose.${p.value}`)}
            </label>
          ))}
          <label className="flex-1 cursor-pointer rounded-lg border border-border px-3 py-2 text-center text-xs font-medium has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary">
            <input
              type="radio"
              name="purpose"
              value=""
              defaultChecked={!filters.purpose}
              className="sr-only"
            />
            {t("any")}
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-semibold text-foreground">
          {t("category")}
        </label>
        <select
          id="category"
          name="category"
          defaultValue={filters.category ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t("allTypes")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {tOptions(`category.${c.value}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="propertyType" className="text-sm font-semibold text-foreground">
          {t("propertyType")}
        </label>
        <select
          id="propertyType"
          name="propertyType"
          defaultValue={filters.propertyType ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t("allTypes")}</option>
          {propertyTypes.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {tOptions(`propertyType.${pt.value}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="city" className="text-sm font-semibold text-foreground">
          {t("city")}
        </label>
        <select
          id="city"
          name="city"
          defaultValue={filters.city ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t("allNewCities")}</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {locale === "ar" ? c.nameAr : c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("priceRange")}</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder={t("min")}
            defaultValue={filters.minPrice ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder={t("max")}
            defaultValue={filters.maxPrice ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("area")}</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minArea"
            placeholder={t("min")}
            defaultValue={filters.minArea ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="maxArea"
            placeholder={t("max")}
            defaultValue={filters.maxArea ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bedrooms" className="text-sm font-semibold text-foreground">
          {t("minBedrooms")}
        </label>
        <select
          id="bedrooms"
          name="bedrooms"
          defaultValue={filters.bedrooms ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{t("any")}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          {t("applyFilters")}
        </button>
        <Link
          href="/listings"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
