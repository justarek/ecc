import { CATEGORIES, CITIES, PURPOSES } from "@/lib/constants";

export default function SearchBar() {
  return (
    <form
      action="/listings"
      className="flex w-full flex-col gap-3 rounded-2xl bg-surface p-4 shadow-xl sm:flex-row sm:items-end sm:gap-2 sm:p-3"
    >
      <div className="flex-1">
        <label htmlFor="q" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="text"
          placeholder="Compound, district, or keyword"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="sm:w-40">
        <label htmlFor="purpose" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Purpose
        </label>
        <select
          id="purpose"
          name="purpose"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">Sale or rent</option>
          {PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-40">
        <label htmlFor="category" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Type
        </label>
        <select
          id="category"
          name="category"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">Units or land</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-48">
        <label htmlFor="city" className="mb-1 block text-xs font-semibold text-muted-foreground">
          City
        </label>
        <select
          id="city"
          name="city"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          defaultValue=""
        >
          <option value="">All new cities</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        Search
      </button>
    </form>
  );
}
