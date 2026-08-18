"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { CurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import LocaleSwitcher from "./LocaleSwitcher";

export default function MobileNav({
  user,
  navLinks,
}: {
  user: CurrentUser | null;
  navLinks: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-lg">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            {user ? (
              <>
                <Link
                  href="/listings/new"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
                >
                  {t("postListing")}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  {t("myDashboard")}
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  {t("favorites")}
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
                  >
                    {t("admin")}
                  </Link>
                )}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-surface-muted"
                  >
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
                >
                  {t("signup")}
                </Link>
              </>
            )}
            <div className="mt-2 border-t border-border pt-3">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
