"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/store/auth";

/**
 * A Log in or Sign up button that signs in with the test account in one click, no form.
 * Stays on the current page, or goes to `then`. Falls back to the log in form if the test login fails.
 */
export function TestLoginButton({ className, children, then }: { className?: string; children: ReactNode; then?: string }) {
  const { user, ready, loginWithTestAccount } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={busy || !ready}
      aria-busy={busy}
      onClick={async () => {
        setBusy(true);
        try {
          if (!user) await loginWithTestAccount();
          if (then) router.push(then);
        } catch {
          router.push(`/login?next=${encodeURIComponent(then ?? window.location.pathname)}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
    </button>
  );
}
