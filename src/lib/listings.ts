import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";

export type ListingCardData = Prisma.ListingGetPayload<{
  include: { images: { orderBy: { position: "asc" }; take: 1 } };
}>;

export type ListingDetailData = Prisma.ListingGetPayload<{
  include: {
    images: { orderBy: { position: "asc" } };
    user: { select: { id: true; name: true; email: true; phone: true; role: true } };
  };
}>;

export type ListingFilters = {
  q?: string;
  city?: string;
  category?: string;
  propertyType?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  sort?: string;
};

export const PAGE_SIZE = 12;

export function buildListingWhere(filters: ListingFilters, opts?: { includeAllStatuses?: boolean }) {
  const where: Prisma.ListingWhereInput = opts?.includeAllStatuses ? {} : { status: "APPROVED" };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { description: { contains: filters.q } },
      { district: { contains: filters.q } },
      { compound: { contains: filters.q } },
    ];
  }
  if (filters.city) where.city = filters.city;
  if (filters.category) where.category = filters.category;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.purpose) where.purpose = filters.purpose;
  if (filters.bedrooms !== undefined) where.bedrooms = { gte: filters.bedrooms };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    where.area = {};
    if (filters.minArea !== undefined) where.area.gte = filters.minArea;
    if (filters.maxArea !== undefined) where.area.lte = filters.maxArea;
  }

  return where;
}

export function buildListingOrderBy(sort?: string): Prisma.ListingOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "area_asc":
      return { area: "asc" };
    case "area_desc":
      return { area: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function searchListings(filters: ListingFilters, page: number) {
  const where = buildListingWhere(filters);
  const orderBy = buildListingOrderBy(filters.sort);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function parseSearchParams(
  sp: Record<string, string | string[] | undefined>
): { filters: ListingFilters; page: number } {
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const num = (key: string) => {
    const v = get(key);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const filters: ListingFilters = {
    q: get("q") || undefined,
    city: get("city") || undefined,
    category: get("category") || undefined,
    propertyType: get("propertyType") || undefined,
    purpose: get("purpose") || undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minArea: num("minArea"),
    maxArea: num("maxArea"),
    bedrooms: num("bedrooms"),
    sort: get("sort") || undefined,
  };

  const page = Math.max(1, num("page") ?? 1);

  return { filters, page };
}
