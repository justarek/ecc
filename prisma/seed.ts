import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { CITIES as CITY_LIST } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200",
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1200",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickImages(count: number) {
  const shuffled = [...IMAGE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const CITIES = [
  "new-cairo",
  "new-administrative-capital",
  "6th-of-october",
  "sheikh-zayed",
  "new-alamein",
  "mostakbal-city",
  "el-shorouk",
  "badya",
  "new-mansoura",
  "new-obour",
];

function jitterCoordinate(base: number) {
  return base + (Math.random() - 0.5) * 0.06; // ~± a few km
}

const UNIT_TYPES = [
  "APARTMENT",
  "DUPLEX",
  "PENTHOUSE",
  "STUDIO",
  "VILLA",
  "TOWNHOUSE",
  "TWIN_HOUSE",
  "OFFICE",
  "RETAIL",
];

const LAND_TYPES = [
  "RESIDENTIAL_LAND",
  "COMMERCIAL_LAND",
  "ADMINISTRATIVE_LAND",
  "AGRICULTURAL_LAND",
];

const COMPOUNDS = [
  "Mountain View",
  "Palm Hills",
  "Hyde Park",
  "Sodic East",
  "Mivida",
  "Zed East",
  "Taj City",
  "IL Bosco",
  "Cairo Gate",
  "Vye Sheikh Zayed",
  null,
  null,
];

const AMENITY_POOL = [
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
];

function amenitiesFor() {
  const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 5));
}

async function main() {
  console.log("Seeding database...");

  await prisma.inquiry.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.image.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const agentPassword = await bcrypt.hash("Agent@12345", 10);
  const userPassword = await bcrypt.hash("User@12345", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@example.com",
      phone: "01000000000",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const agent = await prisma.user.create({
    data: {
      name: "Mona ElSayed",
      email: "agent@example.com",
      phone: "01111234567",
      passwordHash: agentPassword,
      role: "AGENT",
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: "Ahmed Kamal",
      email: "buyer@example.com",
      phone: "01234567890",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  const owners = [admin, agent, buyer];

  const unitTitles = [
    "Modern Apartment with Garden View",
    "Fully Finished Duplex in Gated Compound",
    "Luxury Penthouse with Skyline Views",
    "Cozy Studio Near Business District",
    "Standalone Villa with Private Pool",
    "Spacious Townhouse in Family Community",
    "Twin House with Roof Terrace",
    "Prime Office Space in Business Park",
    "Retail Unit on Main Commercial Strip",
  ];

  const landTitles = [
    "Residential Plot Ready to Build",
    "Corner Land Plot in Prime Location",
    "Commercial Land on Main Axis",
    "Administrative Land Near Downtown District",
    "Agricultural Land with Water Access",
  ];

  let created = 0;

  for (let i = 0; i < 60; i++) {
    const isLand = i % 4 === 0;
    const category = isLand ? "LAND" : "UNIT";
    const propertyType = isLand ? pick(LAND_TYPES) : pick(UNIT_TYPES);
    const city = pick(CITIES);
    const cityCenter = CITY_LIST.find((c) => c.slug === city);
    const purpose = Math.random() > 0.25 ? "SALE" : "RENT";
    const owner = pick(owners);
    const compound = isLand ? null : pick(COMPOUNDS);

    const areaBase = isLand ? 300 + Math.random() * 2000 : 70 + Math.random() * 400;
    const area = Math.round(areaBase);

    const pricePerMeter = isLand ? 8000 + Math.random() * 20000 : 25000 + Math.random() * 45000;
    const price = Math.round((area * pricePerMeter) / 1000) * 1000;

    const title = isLand ? pick(landTitles) : pick(unitTitles);
    const bedrooms = isLand || propertyType === "OFFICE" || propertyType === "RETAIL"
      ? null
      : propertyType === "STUDIO"
        ? 0
        : 1 + Math.floor(Math.random() * 5);
    const bathrooms = bedrooms === null ? null : Math.max(1, Math.floor((bedrooms ?? 1) * 0.75));
    const status = i < 55 ? "APPROVED" : i % 2 === 0 ? "PENDING" : "REJECTED";

    const listing = await prisma.listing.create({
      data: {
        title: `${title} — ${city.replace(/-/g, " ")}`,
        description:
          `${title} located in one of Egypt's most sought-after new cities. ` +
          `This ${isLand ? "plot" : "property"} offers ${area} m² ` +
          `${isLand ? "of land" : "of built-up area"} with easy access to main roads, schools, and services. ` +
          `${compound ? `Situated within ${compound} compound. ` : ""}` +
          "Contact us for more details, pricing options, and to schedule a viewing.",
        category,
        propertyType,
        purpose,
        status,
        price,
        currency: "EGP",
        area,
        bedrooms,
        bathrooms,
        floor: isLand ? null : Math.floor(Math.random() * 12),
        city,
        district: compound ?? undefined,
        compound: compound ?? undefined,
        address: `Plot near main gate, ${city.replace(/-/g, " ")}`,
        latitude: cityCenter ? jitterCoordinate(cityCenter.lat) : null,
        longitude: cityCenter ? jitterCoordinate(cityCenter.lng) : null,
        amenities: isLand ? [] : amenitiesFor(),
        featured: i % 7 === 0,
        views: Math.floor(Math.random() * 500),
        userId: owner.id,
        images: {
          create: pickImages(3 + Math.floor(Math.random() * 3)).map((url, position) => ({
            url,
            position,
          })),
        },
      },
    });

    created += 1;
    if (created % 10 === 0) console.log(`Created ${created} listings...`);

    if (Math.random() > 0.6) {
      await prisma.favorite.create({
        data: {
          userId: pick(owners).id,
          listingId: listing.id,
        },
      }).catch(() => {});
    }
  }

  console.log(`Seed complete. Created ${created} listings.`);
  console.log("Demo accounts:");
  console.log("  admin@example.com / Admin@12345");
  console.log("  agent@example.com / Agent@12345");
  console.log("  buyer@example.com / User@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
