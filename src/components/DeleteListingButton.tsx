"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteListingAction } from "@/app/actions/listings";

export default function DeleteListingButton({ listingId }: { listingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{t("deleteConfirm")}</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteListingAction(listingId);
              router.refresh();
            })
          }
          className="font-semibold text-red-600 hover:underline"
        >
          {isPending ? t("deleting") : t("yesDelete")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-muted-foreground hover:underline"
        >
          {tCommon("cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-red-600 hover:underline"
    >
      {tCommon("delete")}
    </button>
  );
}
