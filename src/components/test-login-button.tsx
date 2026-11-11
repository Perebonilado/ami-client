"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { useAuth } from "@/store/auth";

type Props = { className?: string; children: ReactNode; then?: string };

/**
 * A Log in or Sign up button that signs in with the test account in one click, no form.
 * Stays on the current page, or goes to `then`. Falls back to the log in form if the test login fails.
 */
export function TestLoginButton(props: Props) {
  // The session query reads the current time, which Next.js can't prerender; the boundary defers it
  // to the browser and shows the same disabled button until then.
  return (
    <Suspense
      fallback={
        <button type="button" className={props.className} disabled>
          {props.children}
        </button>
      }
    >
      <LiveTestLoginButton {...props} />
    </Suspense>
  );
}

function LiveTestLoginButton({ className, children, then }: Props) {
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
