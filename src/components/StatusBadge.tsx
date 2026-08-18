const STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

const LABELS: Record<string, string> = {
  APPROVED: "Approved",
  PENDING: "Pending review",
  REJECTED: "Rejected",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? "bg-surface-muted text-foreground"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
