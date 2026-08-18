"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ListingsMapView, { type MapListing } from "@/components/map/ListingsMapView";

export default function ListingsViewToggle({
  mapListings,
  children,
}: {
  mapListings: MapListing[];
  children: ReactNode;
}) {
  const [view, setView] = useState<"grid" | "map">("grid");
  const t = useTranslations("listingsPage");

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
        <button
          type="button"
          onClick={() => setView("grid")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "grid" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-muted"
          }`}
        >
          {t("grid")}
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "map" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-muted"
          }`}
        >
          {t("map", { count: mapListings.length })}
        </button>
      </div>

      {view === "grid" ? children : <ListingsMapView listings={mapListings} />}
    </div>
  );
}
