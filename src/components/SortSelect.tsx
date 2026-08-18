"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const OPTION_VALUES = ["newest", "oldest", "price_asc", "price_desc", "area_asc", "area_desc"] as const;

const KEY_BY_VALUE: Record<(typeof OPTION_VALUES)[number], string> = {
  newest: "newest",
  oldest: "oldest",
  price_asc: "priceAsc",
  price_desc: "priceDesc",
  area_asc: "areaAsc",
  area_desc: "areaDesc",
};

export default function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("sort");

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <select
      value={current ?? "newest"}
      onChange={handleChange}
      className="rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
    >
      {OPTION_VALUES.map((value) => (
        <option key={value} value={value}>
          {t(KEY_BY_VALUE[value])}
        </option>
      ))}
    </select>
  );
}
