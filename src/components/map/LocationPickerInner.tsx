"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createPinIcon } from "./pin-icon";

const pinIcon = createPinIcon();

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center, skip }: { center: [number, number]; skip: boolean }) {
  const map = useMap();
  const prev = useRef(center);

  useEffect(() => {
    if (skip) return;
    if (prev.current[0] === center[0] && prev.current[1] === center[1]) return;
    prev.current = center;
    map.setView(center, map.getZoom());
  }, [center, skip, map]);

  return null;
}

export default function LocationPickerInner({
  initialLat,
  initialLng,
  cityCenter,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
  cityCenter: [number, number];
}) {
  const hasInitial = typeof initialLat === "number" && typeof initialLng === "number";
  const [position, setPosition] = useState<[number, number]>(
    hasInitial ? [initialLat as number, initialLng as number] : cityCenter
  );
  const [touched, setTouched] = useState(hasInitial);
  const t = useTranslations("listingForm");

  return (
    <div>
      <div className="h-64 w-full overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const { lat, lng } = marker.getLatLng();
                setPosition([lat, lng]);
                setTouched(true);
              },
            }}
          />
          <ClickHandler
            onPick={(lat, lng) => {
              setPosition([lat, lng]);
              setTouched(true);
            }}
          />
          <Recenter center={cityCenter} skip={touched} />
        </MapContainer>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("mapHint")}</p>
      <input type="hidden" name="latitude" value={position[0]} />
      <input type="hidden" name="longitude" value={position[1]} />
    </div>
  );
}
