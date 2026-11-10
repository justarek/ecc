"use client";

import { useActionState, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AMENITIES, CATEGORIES, CITIES, CURRENCIES, PROPERTY_TYPES, PURPOSES, cityBySlug } from "@/lib/constants";
import type { ListingActionState } from "@/app/actions/listings";
import { deleteListingImageAction } from "@/app/actions/listings";
import LocationPicker from "@/components/map/LocationPicker";

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]; // Cairo

type Action = (prevState: ListingActionState, formData: FormData) => Promise<ListingActionState>;

export type ListingFormInitialValues = {
  title: string;
  description: string;
  category: string;
  propertyType: string;
  purpose: string;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  city: string;
  district?: string | null;
  compound?: string | null;
  address?: string | null;
  amenities?: string[];
  latitude?: number | null;
  longitude?: number | null;
};

export default function ListingForm({
  action,
  initialValues,
  submitLabel,
  existingImages,
}: {
  action: Action;
  initialValues?: ListingFormInitialValues;
  submitLabel: string;
  existingImages?: { id: string; url: string }[];
}) {
  const [state, formAction, pending] = useActionState<ListingActionState, FormData>(action, null);
  const [category, setCategory] = useState(initialValues?.category ?? "UNIT");
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState(existingImages ?? []);
  const t = useTranslations("listingForm");
  const tOptions = useTranslations("options");
  const locale = useLocale();

  const propertyTypes = useMemo(
    () => PROPERTY_TYPES.filter((t) => t.category === category),
    [category]
  );

  const cityCenter = useMemo((): [number, number] => {
    const match = cityBySlug(city);
    return match ? [match.lat, match.lng] : DEFAULT_CENTER;
  }, [city]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleDeleteExisting(id: string) {
    setImages((imgs) => imgs.filter((img) => img.id !== id));
    try {
      await deleteListingImageAction(id);
    } catch {
      // ignore; revalidation on next load will restore state if it failed
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("basicInfo")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">{t("title")}</label>
            <input
              name="title"
              defaultValue={initialValues?.title}
              required
              placeholder={t("titlePlaceholder")}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.title && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("description")}
            </label>
            <textarea
              name="description"
              defaultValue={initialValues?.description}
              required
              rows={5}
              placeholder={t("descriptionPlaceholder")}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.description && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.description[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("category")}
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {tOptions(`category.${c.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("propertyType")}
            </label>
            <select
              name="propertyType"
              defaultValue={initialValues?.propertyType}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {propertyTypes.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {tOptions(`propertyType.${pt.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("purpose")}
            </label>
            <select
              name="purpose"
              defaultValue={initialValues?.purpose ?? "SALE"}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {tOptions(`purpose.${p.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("city")}</label>
            <select
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">{t("selectCity")}</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {locale === "ar" ? c.nameAr : c.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.city && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.city[0]}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("pricingSize")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("price")}</label>
            <input
              name="price"
              type="number"
              min="0"
              step="1000"
              defaultValue={initialValues?.price}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.price && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.price[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("currency")}
            </label>
            <select
              name="currency"
              defaultValue={initialValues?.currency ?? "EGP"}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("area")}</label>
            <input
              name="area"
              type="number"
              min="0"
              step="1"
              defaultValue={initialValues?.area}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {state?.fieldErrors?.area && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.area[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("floor")}</label>
            <input
              name="floor"
              type="number"
              defaultValue={initialValues?.floor ?? undefined}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {category === "UNIT" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t("bedrooms")}
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue={initialValues?.bedrooms ?? undefined}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t("bathrooms")}
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  defaultValue={initialValues?.bathrooms ?? undefined}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("location")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("compoundOptional")}
            </label>
            <input
              name="compound"
              defaultValue={initialValues?.compound ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("districtOptional")}
            </label>
            <input
              name="district"
              defaultValue={initialValues?.district ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t("addressOptional")}
            </label>
            <input
              name="address"
              defaultValue={initialValues?.address ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("mapLocation")}
          </label>
          <LocationPicker
            initialLat={initialValues?.latitude}
            initialLng={initialValues?.longitude}
            cityCenter={cityCenter}
          />
        </div>
      </section>

      {category === "UNIT" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">{t("amenities")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  name="amenities"
                  value={a}
                  defaultChecked={initialValues?.amenities?.includes(a)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                {tOptions(`amenities.${a}`)}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("photos")}</h2>

        {images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-24 w-32 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(img.id)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs text-background"
                  aria-label={t("removePhoto")}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-foreground">
            {images.length > 0 ? t("addMorePhotos") : t("uploadPhotos")}
          </label>
          <input
            name="images"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            onChange={handleFilesChange}
            className="w-full rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("photoHint")}</p>
        </div>

        {previews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="h-24 w-32 rounded-lg object-cover" />
            ))}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? t("saving") : submitLabel}
      </button>
    </form>
  );
}
