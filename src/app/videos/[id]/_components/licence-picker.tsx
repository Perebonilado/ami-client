"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { RadioCards } from "@/components/ui/controls";
import { FormError, inputClass } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatNaira, handle } from "@/lib/format";
import { DURATIONS, LICENCE_PLATFORMS, USE_TYPES, licencePriceKobo, splitPrice } from "@/lib/pricing";
import type { Duration, LicencePlatform, UseType, Video } from "@/lib/types";

const NEW_ACCOUNT = "__new__";

export function LicencePicker({ video }: { video: Video }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const enabled = video.prices.filter((p) => p.enabled);
  const [useType, setUseType] = useState<UseType>(
    (enabled.find((p) => p.useType === "social") ?? enabled[0])?.useType ?? "repost",
  );
  const [platform, setPlatform] = useState<LicencePlatform>("instagram");
  const [duration, setDuration] = useState<Duration>("30d");
  const [account, setAccount] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const base = video.prices.find((p) => p.useType === useType)?.basePriceKobo ?? 0;
  const price = licencePriceKobo(base, duration, platform);
  const { creatorShareKobo } = splitPrice(price);
  const durationMult = DURATIONS.find((d) => d.value === duration)!.multiplier;

  // Saved handles that fit the chosen platform.
  const accountOptions = useMemo(() => {
    const handles = (user?.socialAccounts ?? []).filter((s) => platform === "all" || s.platform === platform);
    return [
      ...handles.map((s) => ({ value: handle(s.handle), label: `${handle(s.handle)} · ${s.platform === "x" ? "X" : s.platform[0].toUpperCase() + s.platform.slice(1)}` })),
      { value: NEW_ACCOUNT, label: "Another account…" },
    ];
  }, [user, platform]);

  const selectedAccount = account && accountOptions.some((o) => o.value === account) ? account : accountOptions[0].value;
  const coveredAccount = selectedAccount === NEW_ACCOUNT ? newAccount.trim() : selectedAccount;
  const isOwn = user?.id === video.creator.id;

  if (enabled.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Not licensing right now</h2>
        <p className="mt-1 text-[15px] text-muted">The creator has switched off licences for this video.</p>
      </div>
    );
  }

  async function pay() {
    setError(null);
    if (!coveredAccount) {
      setError("Type the handle of the account that will post this video.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.checkout({ videoId: video.id, useType, platform, duration, coveredAccounts: [coveredAccount] });
      router.push(res.paymentUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">License this video</h2>
        <p className="text-sm text-muted">Pick how you&apos;ll use it. The price updates as you choose.</p>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-sm font-semibold">How will you use it?</legend>
        <RadioCards
          label="Licence type"
          value={useType}
          onChange={setUseType}
          options={USE_TYPES.map((u) => {
            const p = video.prices.find((x) => x.useType === u.value);
            return {
              value: u.value,
              title: u.label,
              description: p?.enabled ? u.allows : "The creator doesn't offer this one",
              aside: p?.enabled ? formatNaira(p.basePriceKobo) : undefined,
              disabled: !p?.enabled,
            };
          })}
        />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Select
          label="Platform"
          value={platform}
          onChange={(v) => setPlatform(v as LicencePlatform)}
          options={LICENCE_PLATFORMS.map((p) => ({ value: p.value, label: p.value === "all" ? "All platforms (×2)" : p.label }))}
        />
        <div className="flex flex-col gap-1.5">
          <Select label="Account it covers" value={selectedAccount} onChange={setAccount} options={accountOptions} />
        </div>
      </div>
      {selectedAccount === NEW_ACCOUNT && (
        <div className="-mt-3 flex flex-col gap-1.5">
          <label htmlFor="new-account" className="text-sm font-semibold">
            Account handle
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">@</span>
            <input id="new-account" value={newAccount.replace(/^@/, "")} onChange={(e) => setNewAccount(e.target.value)} placeholder="yourpage" className={`${inputClass} pl-8`} />
          </div>
        </div>
      )}
      <p className="-mt-3 text-[13px] text-muted">Only this account can post the video. Posting from another account isn&apos;t covered.</p>

      <fieldset className="flex flex-col">
        <legend className="mb-2.5 text-sm font-semibold">For how long?</legend>
        <RadioCards
          label="Duration"
          value={duration}
          onChange={setDuration}
          columns={4}
          options={DURATIONS.map((d) => ({ value: d.value, title: d.label, description: `×${d.multiplier}` }))}
        />
      </fieldset>

      <div className="flex flex-col gap-3 rounded-2xl bg-sunken p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-3xl font-extrabold tracking-tight tabular">{formatNaira(price)}</span>
        </div>
        <p className="text-[13px] text-muted tabular">
          {formatNaira(base)} base × {durationMult} ({DURATIONS.find((d) => d.value === duration)!.label.toLowerCase()}) × {platform === "all" ? "2 (all platforms)" : "1 (one platform)"}
        </p>
        <p className="text-[13px] text-muted tabular">
          {formatNaira(creatorShareKobo)} goes to {video.creator.name.split(" ")[0]}.
        </p>
      </div>

      <FormError>{error}</FormError>

      {!ready ? (
        <Button size="lg" disabled className="w-full">
          Pay {formatNaira(price)}
        </Button>
      ) : !user ? (
        <LinkButton href={`/login?next=/videos/${video.id}`} size="lg" className="w-full">
          <Lock size={16} /> Log in to license
        </LinkButton>
      ) : isOwn ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-4 text-sm">
          <p className="font-semibold">This is your video, so you can&apos;t license it.</p>
          <LinkButton href={`/library/videos/${video.id}`} variant="secondary" size="sm" className="w-fit">
            Edit prices
          </LinkButton>
        </div>
      ) : (
        <Button size="lg" variant="ember" className="w-full" onClick={pay} disabled={busy}>
          {busy ? "Starting payment…" : `Pay ${formatNaira(price)}`}
        </Button>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
        <ShieldCheck size={14} /> You&apos;ll get the clean file and a certificate with a QR code.
      </p>
    </div>
  );
}
