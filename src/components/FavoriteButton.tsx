"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export default function FavoriteButton({
  listingId,
  initialFavorited,
  isLoggedIn,
  variant = "icon",
}: {
  listingId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  variant?: "icon" | "full";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("listingDetail");

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setFavorited((f) => !f);
    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(listingId);
        setFavorited(result.favorited);
      } catch {
        setFavorited((f) => !f);
      }
    });
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          favorited
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-foreground hover:bg-surface-muted"
        }`}
      >
        <span>{favorited ? "♥" : "♡"}</span>
        {favorited ? t("saved") : t("save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? t("removeFromFavorites") : t("addToFavorites")}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white ${
        favorited ? "text-primary" : "text-foreground/70"
      }`}
    >
      <span className="text-lg leading-none">{favorited ? "♥" : "♡"}</span>
    </button>
  );
}
