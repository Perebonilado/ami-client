"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HandleFields, handlesFromAccounts, handlesToInput, type Handles } from "@/app/(auth)/_components/handle-fields";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { FormError, TextField } from "@/components/ui/field";
import { Container, PageHeader, Panel, Spinner } from "@/components/ui/page";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/profile");
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner />;
  return <ProfileForm key={user.id} user={user} />;
}

function ProfileForm({ user }: { user: User }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [handles, setHandles] = useState<Handles>(() => handlesFromAccounts(user.socialAccounts));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const res = await api.updateProfile({
        name,
        email,
        businessName: businessName.trim() || null,
        socialAccounts: handlesToInput(handles),
      });
      setUser(res.user);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your profile. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setSaved(false);
  };

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <PageHeader eyebrow="Profile" title="Your details and handles" description="This is what creators and buyers see on licences and certificates." />

        <form onSubmit={save} className="flex flex-col gap-5" noValidate>
          <Panel className="flex flex-col gap-5 p-5 sm:p-7">
            <h2 className="text-lg font-extrabold">About you</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" autoComplete="name" value={name} onChange={(e) => change(setName)(e.target.value)} required />
              <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => change(setEmail)(e.target.value)} required />
            </div>
            <TextField
              label="Business or page name"
              value={businessName}
              onChange={(e) => change(setBusinessName)(e.target.value)}
              placeholder="e.g. Zobo & Co."
              description="Optional. Shown on licences you buy instead of your own name."
            />
          </Panel>

          <Panel className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-extrabold">Social handles</h2>
              <p className="text-[14px] leading-relaxed text-muted">
                Checkout offers these handles when you choose which account a licence covers. Handles show as unverified for now.
              </p>
            </div>
            <HandleFields value={handles} onChange={change(setHandles)} showUnverified />
          </Panel>

          <FormError>{error}</FormError>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={busy || !name.trim() || !email.trim()}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
            {saved && (
              <span role="status" className="flex items-center gap-1.5 text-sm font-semibold text-ok">
                <Check size={16} strokeWidth={3} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </Container>
  );
}
