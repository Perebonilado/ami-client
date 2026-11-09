"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { FormError, TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { AuthShell, safeNext } from "../_components/auth-shell";

const DEMO_ACCOUNTS = [
  { name: "Tolu Adeyemi", detail: "Skit creator", email: "tolu@demo.ami" },
  { name: "Ada Nwosu", detail: "Zobo & Co. (brand)", email: "brand@demo.ami" },
  { name: "Femi Lawal", detail: "Gist Central (blog page)", email: "blog@demo.ami" },
  { name: "Àmì Admin", detail: "Àmì team", email: "admin@demo.ami" },
];
const DEMO_PASSWORD = "demo1234";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { user } = await api.login({ email, password });
      setUser(user);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in. Try again.");
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Log in to Àmì"
      description="Upload your videos, license other people's, and see your earnings."
      footer={
        <section className="flex flex-col gap-3 rounded-3xl border border-dashed border-line-strong bg-white/60 p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold">Demo accounts</h2>
            <p className="text-[13px] text-muted">
              Fills the form for you. Password for all of them: <span className="code font-semibold text-ink">{DEMO_PASSWORD}</span>
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-2.5 text-left transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">{a.name}</span>
                    <span className="truncate text-[12px] text-muted">{a.detail}</span>
                  </span>
                  <span className="code shrink-0 truncate text-[12px] text-muted">{a.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" disabled={busy || !email || !password} className="w-full">
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-sm text-muted">
          New to Àmì?{" "}
          <Link href={`/signup${next !== "/browse" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4 hover:text-ember-ink">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
