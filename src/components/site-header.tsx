"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Menu as MenuIcon, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { initials } from "@/lib/format";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";
import { LinkButton } from "./ui/button";

const navLink =
  "rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-ink data-[active=true]:text-ink";

const menuItem =
  "flex cursor-default items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink outline-none select-none data-highlighted:bg-sunken";

/** Shown while the header waits for the URL during prerendering. */
export function SiteHeaderFallback() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Logo />
      </div>
    </header>
  );
}

export function SiteHeader() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/browse", label: "Browse" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/check", label: "Check a licence" },
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 md:gap-6">
          <Menu.Root>
            <Menu.Trigger
              className="-ml-2 flex size-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-ink md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon size={20} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className="z-50 outline-none" sideOffset={8} align="start">
                <Menu.Popup className="min-w-56 origin-(--transform-origin) rounded-2xl border border-line bg-white p-1.5 shadow-float outline-none transition-[scale,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                  {links.map((l) => (
                    <Menu.LinkItem key={l.href} className={menuItem} render={<Link href={l.href} />}>
                      {l.label}
                    </Menu.LinkItem>
                  ))}
                  {user && (
                    <>
                      <Menu.Separator className="mx-1.5 my-1 h-px bg-line" />
                      <Menu.LinkItem className={menuItem} render={<Link href="/library" />}>
                        My library
                      </Menu.LinkItem>
                    </>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
          <Logo />
          <nav className="hidden items-center md:flex" aria-label="Main">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={navLink} data-active={pathname === l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!ready ? (
            <span className="h-9 w-24" aria-hidden />
          ) : user ? (
            <>
              <Link href="/library" className={`${navLink} hidden sm:inline-flex`} data-active={pathname.startsWith("/library")}>
                My library
              </Link>
              <LinkButton href="/upload" size="sm">
                <Upload size={16} /> Upload
              </LinkButton>
              <Menu.Root>
                <Menu.Trigger
                  className="flex h-9 items-center gap-1 rounded-full border border-line bg-white pr-2 pl-1 text-sm font-semibold transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-ink data-popup-open:border-ink"
                  aria-label="Account menu"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-ember text-[11px] font-bold text-white">{initials(user.name)}</span>
                  <ChevronDown size={14} className="text-muted" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner className="z-50 outline-none" sideOffset={8} align="end">
                    <Menu.Popup className="min-w-56 origin-(--transform-origin) rounded-2xl border border-line bg-white p-1.5 shadow-float outline-none transition-[scale,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                      <div className="px-3 pt-2 pb-2.5">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.businessName ?? user.email}</p>
                      </div>
                      <Menu.Separator className="mx-1.5 my-1 h-px bg-line" />
                      <Menu.LinkItem className={menuItem} render={<Link href="/library" />}>
                        My library
                      </Menu.LinkItem>
                      <Menu.LinkItem className={menuItem} render={<Link href="/profile" />}>
                        Profile and handles
                      </Menu.LinkItem>
                      {user.isAdmin && (
                        <Menu.LinkItem className={menuItem} render={<Link href="/admin" />}>
                          Admin dashboard
                        </Menu.LinkItem>
                      )}
                      <Menu.Separator className="mx-1.5 my-1 h-px bg-line" />
                      <Menu.Item
                        className={menuItem}
                        onClick={async () => {
                          await logout();
                          router.push("/");
                        }}
                      >
                        Log out
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>
                Log in
              </Link>
              <LinkButton href="/signup" size="sm">
                Sign up
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
