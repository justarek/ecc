# DarMasr

A real estate marketplace for buying, selling, and renting **units and land in
Egypt's new cities** — New Cairo, the New Administrative Capital, 6th of
October, Sheikh Zayed, New Alamein, Mostakbal City, and more. Think
Bayut/Dubizzle, scoped to Egypt's new-city development market.

## Features

- **Browse & search** — filter listings by city, category (units vs. land),
  property type, purpose (sale/rent), price range, area range, and bedrooms.
- **Listing detail pages** — photo gallery, amenities, location, agent/owner
  contact card, and an inquiry form.
- **Post a listing** — authenticated users can submit units or land for sale
  or rent, with photo uploads. New listings start as `PENDING` and go through
  moderation before appearing publicly.
- **Dashboard** — manage your own listings (edit/delete), see view counts,
  saves, and inquiries per listing.
- **Favorites** — save listings and revisit them later.
- **Admin moderation queue** — approve/reject submitted listings and feature
  listings on the homepage.
- **Auth** — email/password accounts with hashed passwords and a signed
  session cookie (no third-party auth provider required).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server
  Actions)
- TypeScript, [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma ORM 7](https://www.prisma.io) with SQLite (via the
  `@prisma/adapter-better-sqlite3` driver adapter) — swappable for
  PostgreSQL/MySQL by changing the `datasource` provider and adapter
- `jose` for signed JWT sessions, `bcryptjs` for password hashing, `zod` for
  validation

## Getting started

```bash
npm install
cp .env.example .env      # then set a real AUTH_SECRET (see comment in the file)
npx prisma migrate dev    # creates dev.db and applies the schema
npx prisma db seed        # seeds demo cities, users, and ~60 listings
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
prisma/schema.prisma       Data model (User, Listing, Image, Favorite, Inquiry)
prisma/seed.ts              Demo data seed script
src/lib/                    db client, auth/session helpers, constants, zod schemas
src/app/actions/            Server Actions (auth, listings, favorites, inquiries, admin)
src/app/                    Routes: /, /listings, /listings/[id], /listings/new,
                             /dashboard, /dashboard/listings/[id]/edit, /favorites,
                             /admin, /login, /register
src/components/             UI components (forms, cards, filters, gallery, etc.)
public/uploads/              User-uploaded listing photos (created at runtime)
```

## Notes

- Listing photos are uploaded to `public/uploads/` on the server's local disk.
  For a production deployment on serverless/ephemeral hosting, swap this for
  object storage (e.g. S3-compatible storage) in
  `src/app/actions/listings.ts`.
- SQLite is used for zero-config local development. For production, point
  `DATABASE_URL` and the Prisma adapter (`src/lib/db.ts`, `prisma/seed.ts`,
  `prisma/schema.prisma`) at PostgreSQL/MySQL using the corresponding
  `@prisma/adapter-*` package.
- Run `npx prisma studio` to browse/edit the database visually during
  development.
