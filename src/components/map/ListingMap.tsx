"use client";

import dynamic from "next/dynamic";

const ListingMapInner = dynamic(() => import("./ListingMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-border bg-surface-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function ListingMap(props: { lat: number; lng: number; title: string }) {
  return <ListingMapInner {...props} />;
}
