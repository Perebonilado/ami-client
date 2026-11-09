"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

/** Returns the logged-in user, or null while loading. Sends logged-out visitors to log in. */
export function useRequireUser(next: string) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [ready, user, router, next]);

  return ready ? user : null;
}
