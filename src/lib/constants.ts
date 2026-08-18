export type City = {
  slug: string;
  name: string;
  nameAr: string;
  region: string;
};

// New/planned cities in Egypt where units and land are actively sold.
export const CITIES: City[] = [
  { slug: "new-cairo", name: "New Cairo", nameAr: "القاهرة الجديدة", region: "Greater Cairo" },
  { slug: "new-administrative-capital", name: "New Administrative Capital", nameAr: "العاصمة الإدارية الجديدة", region: "Greater Cairo" },
  { slug: "6th-of-october", name: "6th of October City", nameAr: "مدينة 6 أكتوبر", region: "Greater Cairo" },
  { slug: "sheikh-zayed", name: "Sheikh Zayed City", nameAr: "مدينة الشيخ زايد", region: "Greater Cairo" },
  { slug: "new-alamein", name: "New Alamein", nameAr: "العلمين الجديدة", region: "North Coast" },
  { slug: "mostakbal-city", name: "Mostakbal City", nameAr: "مدينة المستقبل", region: "Greater Cairo" },
  { slug: "el-shorouk", name: "El Shorouk City", nameAr: "مدينة الشروق", region: "Greater Cairo" },
  { slug: "badya", name: "Badya", nameAr: "بادية", region: "Greater Cairo" },
  { slug: "new-mansoura", name: "New Mansoura", nameAr: "المنصورة الجديدة", region: "Delta" },
  { slug: "new-cairo-city-r7", name: "New Heliopolis", nameAr: "هليوبوليس الجديدة", region: "Greater Cairo" },
  { slug: "new-obour", name: "New Obour", nameAr: "العبور الجديدة", region: "Greater Cairo" },
  { slug: "new-aswan", name: "New Aswan", nameAr: "أسوان الجديدة", region: "Upper Egypt" },
];

export const CATEGORIES = [
  { value: "UNIT", label: "Units" },
  { value: "LAND", label: "Land" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment", category: "UNIT" },
  { value: "DUPLEX", label: "Duplex", category: "UNIT" },
  { value: "PENTHOUSE", label: "Penthouse", category: "UNIT" },
  { value: "STUDIO", label: "Studio", category: "UNIT" },
  { value: "VILLA", label: "Villa", category: "UNIT" },
  { value: "TOWNHOUSE", label: "Townhouse", category: "UNIT" },
  { value: "TWIN_HOUSE", label: "Twin House", category: "UNIT" },
  { value: "OFFICE", label: "Office", category: "UNIT" },
  { value: "RETAIL", label: "Retail / Shop", category: "UNIT" },
  { value: "RESIDENTIAL_LAND", label: "Residential Land", category: "LAND" },
  { value: "COMMERCIAL_LAND", label: "Commercial Land", category: "LAND" },
  { value: "ADMINISTRATIVE_LAND", label: "Administrative Land", category: "LAND" },
  { value: "AGRICULTURAL_LAND", label: "Agricultural Land", category: "LAND" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];

export const PURPOSES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
] as const;

export type Purpose = (typeof PURPOSES)[number]["value"];

export const LISTING_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const AMENITIES = [
  "Gated Community",
  "Swimming Pool",
  "Gym",
  "Kids Area",
  "Landscaping / Gardens",
  "Security 24/7",
  "Clubhouse",
  "Central A/C",
  "Private Garden",
  "Roof / Terrace",
  "Parking",
  "Elevator",
  "Nile / Sea View",
  "Smart Home",
  "Commercial Strip Nearby",
  "Schools Nearby",
];

export const CURRENCIES = ["EGP", "USD"] as const;

export function propertyTypeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function cityLabel(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number) {
  return `${new Intl.NumberFormat("en-US").format(area)} m²`;
}
