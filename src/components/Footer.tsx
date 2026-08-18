import Link from "next/link";
import { CITIES } from "@/lib/constants";

export default function Footer() {
  const featuredCities = CITIES.slice(0, 6);

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                D
              </span>
              <span className="text-base font-bold text-foreground">
                Dar<span className="text-primary">Masr</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Egypt&apos;s marketplace for buying and selling units and land in the new
              cities — New Cairo, the New Capital, and beyond.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/listings?category=UNIT" className="hover:text-primary">
                  Units for sale
                </Link>
              </li>
              <li>
                <Link href="/listings?category=LAND" className="hover:text-primary">
                  Land for sale
                </Link>
              </li>
              <li>
                <Link href="/listings?purpose=RENT" className="hover:text-primary">
                  Properties for rent
                </Link>
              </li>
              <li>
                <Link href="/listings/new" className="hover:text-primary">
                  Post a listing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">New cities</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {featuredCities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/listings?city=${city.slug}`} className="hover:text-primary">
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-primary">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  My dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} DarMasr. All rights reserved.</p>
          <p>Built for buyers, sellers, and brokers across Egypt&apos;s new cities.</p>
        </div>
      </div>
    </footer>
  );
}
