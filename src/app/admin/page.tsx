import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import AdminListingRow from "@/components/AdminListingRow";

export const metadata: Metadata = { title: "Admin — Moderation" };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin");
  if (user.role !== "ADMIN") redirect("/");

  const sp = await searchParams;
  const statusFilter = typeof sp.status === "string" ? sp.status : "PENDING";

  const [listings, counts] = await Promise.all([
    prisma.listing.findMany({
      where: statusFilter === "ALL" ? {} : { status: statusFilter },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.listing.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.status]));

  const tabs = [
    { value: "PENDING", label: "Pending", count: countMap.PENDING ?? 0 },
    { value: "APPROVED", label: "Approved", count: countMap.APPROVED ?? 0 },
    { value: "REJECTED", label: "Rejected", count: countMap.REJECTED ?? 0 },
    { value: "ALL", label: "All", count: listings.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Listing moderation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review, approve, or reject listings submitted by users.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`/admin?status=${tab.value}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-surface-muted"
            }`}
          >
            {tab.label} ({tab.count})
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">No listings in this category.</p>
          </div>
        ) : (
          listings.map((listing) => <AdminListingRow key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
