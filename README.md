# DarMasr

A real estate marketplace for buying, selling, and renting **units and land in
Egypt's new cities** — New Cairo, the New Administrative Capital, 6th of
October, Sheikh Zayed, New Alamein, Mostakbal City, and more. Think
Bayut/Dubizzle, scoped to Egypt's new-city development market.

## Features

- **Browse & search** — filter listings by city, category (units vs. land),
  property type, purpose (sale/rent), price range, area range, and bedrooms.
  Toggle between a grid view and an interactive map view of results.
- **Listing detail pages** — photo gallery, amenities, an interactive map of
  the property location, agent/owner contact card, and an inquiry form.
- **Post a listing** — authenticated users can submit units or land for sale
  or rent, with photo uploads and a click-to-place map location picker. New
  listings start as `PENDING` and go through moderation before appearing
  publicly.
- **Dashboard** — manage your own listings (edit/delete), see view counts,
  saves, and inquiries per listing.
- **Favorites** — save listings and revisit them later.
- **Admin moderation queue** — approve/reject submitted listings and feature
  listings on the homepage.
- **Auth** — email/password accounts with hashed passwords and a signed
  session cookie (no third-party auth provider required).
- **Bilingual (English / Arabic)** — full UI translation with a language
  switcher and right-to-left layout for Arabic.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server
  Actions)
- TypeScript, [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma ORM 7](https://www.prisma.io) with PostgreSQL (via the
  `@prisma/adapter-pg` driver adapter)
- [next-intl](https://next-intl.dev) for English/Arabic localization and RTL
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org)
  with OpenStreetMap tiles for location picking and map views (no API key
  required)
- `jose` for signed JWT sessions, `bcryptjs` for password hashing, `zod` for
  validation
- `@aws-sdk/client-s3` for optional S3-compatible object storage of listing
  photos, with a local-disk fallback for development

## Getting started

You'll need a PostgreSQL database (local, Docker, or hosted).

```bash
npm install
cp .env.example .env        # set DATABASE_URL and a real AUTH_SECRET (see comments in the file)
npx prisma migrate dev      # applies the schema
npx prisma db seed          # seeds demo cities, users, and ~60 listings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (created by the seed script)

| Role  | Email               | Password      |
| ----- | -------------------- | -------------- |
| Admin | admin@example.com    | Admin@12345    |
| Agent | agent@example.com    | Agent@12345    |
| Buyer | buyer@example.com    | User@12345     |

The admin account can access `/admin` to approve/reject/feature listings.

## Project structure

```
prisma/schema.prisma         Data model (User, Listing, Image, Favorite, Inquiry)
prisma/seed.ts                Demo data seed script
messages/en.json, ar.json     UI translation catalogs
src/i18n/                     next-intl locale config + request config (cookie-based, no /en /ar routing)
src/lib/                      db client, auth/session helpers, object storage, constants, zod schemas
src/app/actions/               Server Actions (auth, listings, favorites, inquiries, admin)
src/app/                      Routes: /, /listings, /listings/[id], /listings/new,
                               /dashboard, /dashboard/listings/[id]/edit, /favorites,
                               /admin, /login, /register
src/components/                UI components (forms, cards, filters, gallery, etc.)
src/components/map/            Leaflet map components (location picker, listing map, listings map view)
public/uploads/                 Local-disk fallback storage for listing photos (created at runtime)
```

## Localization

The app ships with English and Arabic translations (`messages/en.json`,
`messages/ar.json`) and a language switcher in the header. Locale is stored in
a `locale` cookie (no `/en`/`/ar` URL prefixes) and drives both the
translated UI strings and the document's `dir` attribute (`ltr`/`rtl`).
User-generated content (listing titles/descriptions) is not machine-translated,
matching how real listing marketplaces handle it.

## Maps

Listing location is optional. When posting or editing a listing, click or
drag the pin on the map to set coordinates (defaults to the selected city's
center) — no API key needed since it uses OpenStreetMap tiles. Listings with
a location show an interactive map on their detail page, and the listings
search page can toggle between a grid and a map view of the current results.

## Object storage for photos

Listing photos are uploaded via `src/lib/storage.ts`, which:

- Uses S3-compatible object storage (AWS S3, Cloudflare R2, DigitalOcean
  Spaces, MinIO, Backblaze B2, ...) when `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and
  `S3_SECRET_ACCESS_KEY` are set (see `.env.example` for the full list of
  optional S3 variables).
- Falls back to local disk at `public/uploads/` otherwise, so local
  development works with zero cloud configuration.

## Notes

- Run `npx prisma studio` to browse/edit the database visually during
  development.
- To point at a different database engine, change the `datasource` provider
  in `prisma/schema.prisma`, swap the driver adapter in `src/lib/db.ts` and
  `prisma/seed.ts` (e.g. `@prisma/adapter-mariadb` for MySQL), and update
  `DATABASE_URL`.
