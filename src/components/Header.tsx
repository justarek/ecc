import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import MobileNav from "./MobileNav";

export default async function Header() {
  const user = await getCurrentUser();

  const navLinks = [
    { href: "/listings?category=UNIT", label: "Units" },
    { href: "/listings?category=LAND", label: "Land" },
    { href: "/listings?purpose=RENT", label: "Rent" },
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
          {user ? (
            <>
              <Link
                href="/listings/new"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                + Post a listing
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
                  Admin
                </Link>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <MobileNav user={user} navLinks={navLinks} />
      </div>
    </header>
  );
}
