import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { cityLabel } from "@/lib/constants";
import type { CreateVideoParams, VideoAspect } from "@/lib/moneyprinter";

type ListingForVideo = {
  title: string;
  category: string;
  propertyType: string;
  purpose: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  compound: string | null;
  amenities: string[];
};

// English stock-footage search terms (Pexels) per property type. The terms
// only pick background clips, so they stay in English for every locale.
const PROPERTY_TYPE_TERMS: Record<string, string[]> = {
  APARTMENT: ["modern apartment interior", "luxury living room", "apartment building"],
  DUPLEX: ["modern duplex interior", "luxury living room", "modern staircase"],
  PENTHOUSE: ["penthouse terrace", "luxury apartment view", "city skyline night"],
  STUDIO: ["studio apartment interior", "cozy modern bedroom"],
  VILLA: ["luxury villa", "modern house exterior", "villa swimming pool"],
  TOWNHOUSE: ["modern townhouse", "residential neighborhood", "modern house exterior"],
  TWIN_HOUSE: ["modern house exterior", "residential neighborhood", "family home garden"],
  OFFICE: ["modern office interior", "business district", "office building"],
  RETAIL: ["retail store interior", "shopping mall", "storefront"],
  RESIDENTIAL_LAND: ["aerial view land plot", "desert aerial view", "construction site aerial"],
  COMMERCIAL_LAND: ["aerial view land plot", "construction site aerial", "business district aerial"],
  ADMINISTRATIVE_LAND: ["aerial view land plot", "construction site aerial", "city aerial view"],
  AGRICULTURAL_LAND: ["farmland aerial", "green fields", "agriculture irrigation"],
};

const AMENITY_TERMS: Record<string, string> = {
  "Swimming Pool": "swimming pool",
  Gym: "gym interior",
  "Landscaping / Gardens": "landscaped garden",
  "Private Garden": "private garden",
  "Roof / Terrace": "rooftop terrace",
  "Nile / Sea View": "sea view balcony",
  "Kids Area": "kids playground",
  Clubhouse: "clubhouse",
};

const DEFAULT_VOICES: Record<Locale, string> = {
  en: "en-US-AriaNeural-Female",
  ar: "ar-EG-SalmaNeural-Female",
};

function videoAspect(): VideoAspect {
  const aspect = process.env.MONEYPRINTER_VIDEO_ASPECT;
  return aspect === "16:9" || aspect === "1:1" ? aspect : "9:16";
}

/**
 * Builds a MoneyPrinterTurbo request for a listing. The narration script and
 * footage keywords are generated here from the listing's fields, so the
 * MoneyPrinterTurbo server doesn't need an LLM provider configured — only a
 * stock footage key (Pexels) and a TTS voice.
 */
export async function buildListingVideoParams(
  listing: ListingForVideo,
  locale: Locale
): Promise<CreateVideoParams> {
  const t = await getTranslations({ locale, namespace: "listingVideo.script" });
  const tOptions = await getTranslations({ locale, namespace: "options" });
  const numberFormat = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US");

  const sentences = [
    t("intro", {
      type: tOptions(`propertyType.${listing.propertyType}`),
      purpose: listing.purpose,
      city: cityLabel(listing.city, locale),
    }),
  ];
  if (listing.compound) sentences.push(t("compound", { compound: listing.compound }));
  sentences.push(t("area", { area: numberFormat.format(listing.area) }));
  if (listing.bedrooms) sentences.push(t("bedrooms", { count: listing.bedrooms }));
  if (listing.bathrooms) sentences.push(t("bathrooms", { count: listing.bathrooms }));
  if (listing.amenities.length > 0) {
    const list = new Intl.ListFormat(locale, { type: "conjunction" }).format(
      listing.amenities.slice(0, 4).map((a) => tOptions(`amenities.${a}`))
    );
    sentences.push(t("amenities", { list }));
  }
  sentences.push(
    t("price", {
      purpose: listing.purpose,
      price: numberFormat.format(Math.round(listing.price)),
      currency: listing.currency,
    })
  );
  sentences.push(t("outro"));

  const terms = [
    ...(PROPERTY_TYPE_TERMS[listing.propertyType] ??
      (listing.category === "LAND" ? PROPERTY_TYPE_TERMS.RESIDENTIAL_LAND : PROPERTY_TYPE_TERMS.APARTMENT)),
    ...listing.amenities.flatMap((a) => (AMENITY_TERMS[a] ? [AMENITY_TERMS[a]] : [])),
  ];

  // MoneyPrinterTurbo's bundled subtitle fonts don't cover Arabic, so Arabic
  // subtitles are only rendered when an Arabic-capable font has been added to
  // the server's resource/fonts directory and named here.
  const arabicFont = process.env.MONEYPRINTER_ARABIC_FONT;
  const subtitles =
    locale === "ar"
      ? { subtitle_enabled: Boolean(arabicFont), font_name: arabicFont || undefined }
      : { subtitle_enabled: true, font_name: process.env.MONEYPRINTER_FONT || "MicrosoftYaHeiBold.ttc" };

  return {
    video_subject: listing.title,
    video_script: sentences.join(" "),
    video_terms: [...new Set(terms)].slice(0, 6),
    video_language: locale === "ar" ? "ar-EG" : "en-US",
    voice_name:
      (locale === "ar" ? process.env.MONEYPRINTER_VOICE_AR : process.env.MONEYPRINTER_VOICE_EN) ||
      DEFAULT_VOICES[locale],
    video_aspect: videoAspect(),
    ...subtitles,
  };
}
