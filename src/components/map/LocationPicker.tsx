"use client";

import dynamic from "next/dynamic";

const LocationPickerInner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-surface-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function LocationPicker(props: {
  initialLat?: number | null;
  initialLng?: number | null;
  cityCenter: [number, number];
}) {
  return <LocationPickerInner {...props} />;
}
