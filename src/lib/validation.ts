import { z } from "zod";
import { CATEGORIES, PROPERTY_TYPES, PURPOSES, CURRENCIES } from "./constants";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const propertyTypeValues = PROPERTY_TYPES.map((t) => t.value) as [string, ...string[]];
const purposeValues = PURPOSES.map((p) => p.value) as [string, ...string[]];
const currencyValues = [...CURRENCIES] as [string, ...string[]];

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+20|0)?1[0125]\d{8}$/, "Enter a valid Egyptian phone number")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
  category: z.enum(categoryValues),
  propertyType: z.enum(propertyTypeValues),
  purpose: z.enum(purposeValues),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.enum(currencyValues).default("EGP"),
  area: z.coerce.number().positive("Area must be greater than 0"),
  bedrooms: z.coerce.number().int().min(0).max(20).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional().nullable(),
  floor: z.coerce.number().int().min(-2).max(200).optional().nullable(),
  city: z.string().trim().min(1, "Choose a city"),
  district: z.string().trim().max(120).optional().or(z.literal("")),
  compound: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  amenities: z.array(z.string()).optional().default([]),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+20|0)?1[0125]\d{8}$/, "Enter a valid Egyptian phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});
