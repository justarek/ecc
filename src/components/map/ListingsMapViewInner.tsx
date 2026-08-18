"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatPrice } from "@/lib/constants";
import { createPinIcon } from "./pin-icon";

const pinIcon = createPinIcon();

export type MapListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  latitude: number;
  longitude: number;
};

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]; // Cairo

export default function ListingsMapViewInner({ listings }: { listings: MapListing[] }) {
  const t = useTranslations("listingsPage");
  const tDetail = useTranslations("listingDetail");
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (listings.length === 0) return null;
    return listings.map((l) => [l.latitude, l.longitude]);
  }, [listings]);

  if (listings.length === 0) {
    return (
      <div className="flex h-[28rem] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted text-sm text-muted-foreground">
        {t("noMapListings")}
      </div>
    );
  }

  return (
    <div className="h-[28rem] w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [30, 30] }}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((l) => (
          <Marker key={l.id} position={[l.latitude, l.longitude]} icon={pinIcon}>
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{formatPrice(l.price, l.currency)}</span>
                <span className="text-sm">{l.title}</span>
                <Link href={`/listings/${l.id}`} className="text-sm text-primary underline">
                  {tDetail("viewListing")}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
