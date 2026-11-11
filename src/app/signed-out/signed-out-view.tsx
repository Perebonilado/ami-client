"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TestLoginButton } from "@/components/test-login-button";

/** Shown when someone who logged out opens a page that needs an account. */
export function SignedOutView() {
  const raw = useSearchParams().get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/library";
  return (
    <div className="empty">
      <h2>You’re logged out</h2>
      <p>Log in to carry on where you were.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <TestLoginButton className="btn btn-ink" then={next}>
          Log in
        </TestLoginButton>
        <Link href="/browse" className="btn btn-ghost">
          Browse videos
        </Link>
      </div>
    </div>
  );
}
