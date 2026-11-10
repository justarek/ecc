"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { localeCookieName, locales, type Locale } from "@/i18n/config";

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // eslint-disable-next-line react-hooks/immutability -- setting a cookie in a click handler, not a render-phase mutation
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-1 rounded-full border border-border p-1 text-xs font-medium ${className}`}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending}
          onClick={() => switchTo(l)}
          className={`rounded-full px-2.5 py-1 transition-colors disabled:opacity-60 ${
            locale === l
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-surface-muted"
          }`}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
