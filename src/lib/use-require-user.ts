"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";

/**
 * Returns the logged-in user, or null while loading.
 * Logged-out visitors are signed in with the test account and stay on the page.
 * After someone logs out, pages that need an account show "You're logged out" with a Log in button instead.
 * If the test login fails, they get the log in form.
 */
export function useRequireUser(next: string) {
  const { user, ready, signedOut, loginWithTestAccount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || user) return;
    if (signedOut) return void router.replace(`/signed-out?next=${encodeURIComponent(next)}`);
    loginWithTestAccount().catch(() => router.replace(`/login?next=${encodeURIComponent(next)}`));
  }, [ready, user, signedOut, loginWithTestAccount, router, next]);

  return ready ? user : null;
}
