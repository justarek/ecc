"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  generateListingVideoAction,
  refreshListingVideoAction,
  type ListingVideoState,
} from "@/app/actions/video";

const POLL_INTERVAL_MS = 5000;

/** Owner/admin controls for generating a listing's MoneyPrinterTurbo promo video. */
export default function ListingVideoPanel({
  listingId,
  initialState,
}: {
  listingId: string;
  initialState: ListingVideoState;
}) {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("listingVideo");
  const processing = state.status === "PROCESSING";

  useEffect(() => {
    if (!processing) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const next = await refreshListingVideoAction(listingId);
        if (!cancelled) setState(next);
      } catch {
        // Network hiccup; try again on the next tick.
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [listingId, processing]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("description")}</p>
        </div>
        {!processing && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setState(await generateListingVideoAction(listingId));
              })
            }
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? t("starting") : state.videoUrl ? t("regenerate") : t("generate")}
          </button>
        )}
      </div>

      {processing && (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">{t("generating", { progress: state.progress })}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {state.transientError ? t("unreachable") : t("generatingHint")}
          </p>
        </div>
      )}

      {state.error && !state.transientError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.status === "FAILED" ? `${t("failed")} ` : ""}
          {state.error}
        </p>
      )}

      {state.videoUrl && (
        <video
          key={state.videoUrl}
          src={state.videoUrl}
          controls
          preload="metadata"
          className="mt-4 max-h-[480px] w-full rounded-xl bg-black"
        />
      )}
    </div>
  );
}
