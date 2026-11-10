import { useTranslations } from "next-intl";

const STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("status");
  const key = status.toLowerCase();

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? "bg-surface-muted text-foreground"}`}
    >
      {["pending", "approved", "rejected"].includes(key) ? t(key) : status}
    </span>
  );
}
