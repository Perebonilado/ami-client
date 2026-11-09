"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { FormError, TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { AuthShell, safeNext } from "../_components/auth-shell";
import { emptyHandles, HandleFields, handlesToInput } from "../_components/handle-fields";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [handles, setHandles] = useState(emptyHandles);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const passwordShort = password.length > 0 && password.length < 8;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const { user } = await api.signup({
        name,
        email,
        password,
        businessName: businessName.trim() || undefined,
        socialAccounts: handlesToInput(handles),
      });
      setUser(user);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your account. Try again.");
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your Àmì account" description="One account does both: list your own videos, and license other people's.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          description="At least 8 characters."
          error={passwordShort ? "At least 8 characters." : null}
          required
        />

        <Collapsible.Root className="rounded-2xl border border-line bg-sunken/60">
          <Collapsible.Trigger className="group flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Add your pages (optional)</span>
              <span className="text-[13px] text-muted">Business name and social handles. You can add these later in Profile.</span>
            </span>
            <ChevronDown size={18} className="shrink-0 text-muted transition-transform duration-150 group-data-panel-open:rotate-180" />
          </Collapsible.Trigger>
          <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 [&[hidden]:not([hidden='until-found'])]:hidden">
            <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
              <TextField label="Business or page name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Zobo & Co." />
              <HandleFields value={handles} onChange={setHandles} />
              <p className="text-[13px] text-muted">Handles show as unverified for now.</p>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>

        <FormError>{error}</FormError>
        <Button type="submit" size="lg" disabled={busy || !name || !email || !password} className="w-full">
          {busy ? "Creating your account…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href={`/login${next !== "/browse" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4 hover:text-ember-ink">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
