"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { BARE_ROUTES } from "./site-header";

export function SiteFooter() {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) return null;
  return (
    <footer className="foot no-print">
      <div className="wrap foot-in">
        <Logo />
        <span>Your work. Your mark. Your money.</span>
        <nav aria-label="Footer">
          <Link href="/browse">Browse</Link>
          <Link href="/#creators">For creators</Link>
          <Link href="/check">Check a licence</Link>
          <Link href="/upload">Upload a video</Link>
        </nav>
      </div>
    </footer>
  );
}
