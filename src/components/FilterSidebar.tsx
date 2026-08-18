import Link from "next/link";
import { CATEGORIES, CITIES, PROPERTY_TYPES, PURPOSES } from "@/lib/constants";
import type { ListingFilters } from "@/lib/listings";

export default function FilterSidebar({ filters }: { filters: ListingFilters }) {
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
        <h3 className="text-sm font-semibold text-foreground">Purpose</h3>
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
              {p.label}
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
            Any
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-semibold text-foreground">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={filters.category ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Units or land</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="propertyType" className="text-sm font-semibold text-foreground">
          Property type
        </label>
        <select
          id="propertyType"
          name="propertyType"
          defaultValue={filters.propertyType ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All types</option>
          {propertyTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="city" className="text-sm font-semibold text-foreground">
          City
        </label>
        <select
          id="city"
          name="city"
          defaultValue={filters.city ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All new cities</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Price range (EGP)</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            defaultValue={filters.minPrice ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            defaultValue={filters.maxPrice ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Area (m²)</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minArea"
            placeholder="Min"
            defaultValue={filters.minArea ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="maxArea"
            placeholder="Max"
            defaultValue={filters.maxArea ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bedrooms" className="text-sm font-semibold text-foreground">
          Min. bedrooms
        </label>
        <select
          id="bedrooms"
          name="bedrooms"
          defaultValue={filters.bedrooms ?? ""}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Any</option>
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
          Apply filters
        </button>
        <Link
          href="/listings"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
