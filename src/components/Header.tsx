import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import MobileNav from "./MobileNav";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Header() {
  const user = await getCurrentUser();
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/listings?category=UNIT", label: t("units") },
    { href: "/listings?category=LAND", label: t("land") },
    { href: "/listings?purpose=RENT", label: t("rent") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            D
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Dar<span className="text-primary">Masr</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          {user ? (
            <>
              <Link
                href="/listings/new"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                {t("postListing")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition-colors"
              >
                {user.name.split(" ")[0]}
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition-colors"
                >
                  {t("admin")}
                </Link>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>

        <MobileNav user={user} navLinks={navLinks} />
      </div>
    </header>
  );
}
