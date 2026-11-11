"use client";

import { Menu } from "@base-ui/react/menu";
import { Menu as MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { initials } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { TestLoginButton } from "./test-login-button";

/** The log in and sign up forms have their own minimal top bar. */
export const BARE_ROUTES = ["/login", "/signup"];

const LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/check", label: "Check a licence" },
];

/** Shown while the header waits for the URL during prerendering. */
export function SiteHeaderFallback() {
  return (
    <header className="nav no-print">
      <div className="wrap nav-in">
        <Logo />
      </div>
    </header>
  );
}

const noop = () => () => {};

export function SiteHeader() {
  const { user, ready, logout, loginWithTestAccount } = useAuth();
  // The header can finish loading after the login check does. Until it has, show what the server
  // showed (the empty slot), or React sees a different header in the browser and rebuilds it.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const pathname = usePathname();
  const router = useRouter();
  if (BARE_ROUTES.includes(pathname)) return null;
  const here = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined);

  return (
    <header className="nav no-print">
      <div className="wrap nav-in">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={here(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        {/* Browse has its own big search bar */}
        {pathname !== "/browse" && <NavSearch />}

        <div className="nav-end">
          {!ready || !hydrated ? (
            <span style={{ width: 120, height: 42 }} aria-hidden />
          ) : user ? (
            <>
              <Link href="/library" className="nav-text" aria-current={here("/library")}>
                My library
              </Link>
              <Menu.Root>
                <Menu.Trigger className="avatar-btn" aria-label="Your account">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" />
                  ) : (
                    initials(user.name)
                  )}
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={10} align="end" className="z-50 outline-none">
                    <Menu.Popup className="menu-pop">
                      <div className="menu-who">
                        <b>{user.name}</b>
                        <span>{user.businessName ?? user.email}</span>
                      </div>
                      <Menu.Separator className="menu-sep" />
                      <Menu.LinkItem className="menu-item" render={<Link href="/library" />}>
                        My library
                      </Menu.LinkItem>
                      <Menu.LinkItem className="menu-item" render={<Link href="/upload" />}>
                        Upload a video
                      </Menu.LinkItem>
                      {user.isAdmin && (
                        <Menu.LinkItem className="menu-item" render={<Link href="/admin" />}>
                          Admin
                        </Menu.LinkItem>
                      )}
                      <Menu.Separator className="menu-sep" />
                      <Menu.Item
                        className="menu-item"
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
              <TestLoginButton className="nav-text">Log in</TestLoginButton>
              <TestLoginButton className="btn btn-ink btn-sm nav-signup">Sign up</TestLoginButton>
            </>
          )}

          <Menu.Root>
            <Menu.Trigger className="nav-menu" aria-label="Open menu">
              <MenuIcon aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={10} align="end" className="z-50 outline-none">
                <Menu.Popup className="menu-pop">
                  {LINKS.map((l) => (
                    <Menu.LinkItem key={l.href} className="menu-item" render={<Link href={l.href} />}>
                      {l.label}
                    </Menu.LinkItem>
                  ))}
                  <Menu.Separator className="menu-sep" />
                  {user ? (
                    <>
                      <Menu.LinkItem className="menu-item" render={<Link href="/library" />}>
                        My library
                      </Menu.LinkItem>
                      <Menu.LinkItem className="menu-item" render={<Link href="/upload" />}>
                        Upload a video
                      </Menu.LinkItem>
                    </>
                  ) : (
                    <Menu.Item className="menu-item" onClick={() => loginWithTestAccount().catch(() => router.push("/login"))}>
                      Log in
                    </Menu.Item>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
  );
}

/** Compact search in the nav. Enter takes you to Browse with the results. */
function NavSearch() {
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <div className="nav-search">
      <SearchBar
        compact
        value={text}
        onChange={setText}
        onSubmit={(q) => {
          router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
          setText("");
        }}
      />
    </div>
  );
}
