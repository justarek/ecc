import { useTranslations } from "next-intl";

function buildHref(basePath: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `${basePath}?${next.toString()}`;
}

export default function Pagination({
  basePath,
  searchParams,
  page,
  pageCount,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  pageCount: number;
}) {
  const t = useTranslations("listingsPage");

  if (pageCount <= 1) return null;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <a
        href={page > 1 ? buildHref(basePath, params, page - 1) : undefined}
        aria-disabled={page <= 1}
        className={`rounded-lg border border-border px-3 py-2 text-sm font-medium ${
          page <= 1 ? "pointer-events-none text-muted-foreground/50" : "text-foreground hover:bg-surface-muted"
        }`}
      >
        {t("prev")}
      </a>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <a
            href={buildHref(basePath, params, p)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-surface-muted"
            }`}
          >
            {p}
          </a>
        </span>
      ))}

      <a
        href={page < pageCount ? buildHref(basePath, params, page + 1) : undefined}
        aria-disabled={page >= pageCount}
        className={`rounded-lg border border-border px-3 py-2 text-sm font-medium ${
          page >= pageCount ? "pointer-events-none text-muted-foreground/50" : "text-foreground hover:bg-surface-muted"
        }`}
      >
        {t("next")}
      </a>
    </nav>
  );
}
