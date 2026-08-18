"use client";

import dynamic from "next/dynamic";
import type { MapListing } from "./ListingsMapViewInner";

export type { MapListing };

const ListingsMapViewInner = dynamic(() => import("./ListingsMapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] w-full items-center justify-center rounded-2xl border border-border bg-surface-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function ListingsMapView({ listings }: { listings: MapListing[] }) {
  return <ListingsMapViewInner listings={listings} />;
}
