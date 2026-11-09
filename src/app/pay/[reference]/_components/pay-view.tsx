"use client";

import { CreditCard, Landmark, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { EmptyState, Spinner } from "@/components/ui/page";
import { VideoThumb } from "@/components/video-thumb";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { durationLabel, platformLabel, labelForUseType } from "@/lib/pricing";
import { useApi } from "@/lib/use-api";

/**
 * Stand-in for the Access Bank sandbox checkout.
 * When sandbox access lands, `api.checkout` returns the bank's payment URL instead of /pay/:reference,
 * and the bank's webhook marks the payment paid. Keep this page as the hidden "simulate payment" switch.
 */
export function PayView({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const { user, ready } = useAuth();
  const router = useRouter();
  const { data, error, loading } = useApi(() => (user ? api.getPayment(reference) : Promise.reject(new Error("login"))), [reference, user?.id]);
  const [method, setMethod] = useState<"transfer" | "card">("transfer");
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/pay/${reference}`);
  }, [ready, user, router, reference]);

  useEffect(() => {
    if (data?.status === "paid") router.replace(`/licences/${data.licence.licenceNumber}?paid=1`);
  }, [data, router]);

  if (!ready || (loading && !data)) return <Spinner label="Loading payment" />;
  if (error || !data)
    return (
      <div className="w-full max-w-lg">
        <EmptyState title="We couldn't find this payment" action={<LinkButton href="/browse" variant="secondary" size="sm">Back to browse</LinkButton>}>
          Start again from the video you want to license.
        </EmptyState>
      </div>
    );

  const { licence, video } = data;

  async function settle(outcome: "paid" | "failed") {
    setBusy(true);
    setPayError(null);
    await new Promise((r) => setTimeout(r, outcome === "paid" ? 1200 : 600));
    try {
      const res = await api.simulatePayment(reference, outcome);
      if (res.status === "paid") router.replace(`/licences/${res.licence.licenceNumber}?paid=1`);
      else {
        setPayError("The payment didn't go through. No money was taken. Try again or use another method.");
        setBusy(false);
      }
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-warn/40 bg-warn-wash px-4 py-2.5 text-[13px] font-semibold text-warn">
        <span>Payment sandbox · no real money moves</span>
        <span className="code text-[11px]">{reference}</span>
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-6 shadow-float sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-muted">Paying Àmì</p>
            <p className="text-3xl font-extrabold tracking-tight tabular">{formatNaira(data.amountKobo)}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-sunken px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-line">
            <Lock size={12} /> Secure checkout
          </span>
        </div>

        <div className="flex gap-3 rounded-2xl bg-sunken p-3">
          <VideoThumb thumbnailUrl={video.thumbnailUrl} poster={video.poster} title="" showPlay={false} className="h-20 w-16 shrink-0 rounded-xl" />
          <div className="min-w-0 text-sm">
            <p className="line-clamp-2 font-bold">{video.title}</p>
            <p className="mt-1 text-muted">
              {labelForUseType(licence.useType)} · {platformLabel(licence.platform)} · {durationLabel(licence.duration)}
            </p>
            <p className="text-muted">Covers {licence.coveredAccounts.join(", ")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
          {(
            [
              { value: "transfer", label: "Bank transfer", icon: Landmark },
              { value: "card", label: "Card", icon: CreditCard },
            ] as const
          ).map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={method === m.value}
              onClick={() => setMethod(m.value)}
              className="flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-semibold transition-colors hover:border-line-strong aria-checked:border-ink aria-checked:shadow-[inset_0_0_0_1px_var(--color-ink)]"
            >
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </div>

        {method === "transfer" ? (
          <div className="flex flex-col gap-1 rounded-2xl border border-line p-4 text-sm">
            <p className="text-muted">Transfer exactly</p>
            <p className="text-lg font-bold tabular">{formatNaira(data.amountKobo)}</p>
            <p className="text-muted">
              to <span className="font-semibold text-ink">Àmì Collections · 0123456789</span> (sandbox account)
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 rounded-2xl border border-line p-4 text-sm text-muted">
            <p>The bank&apos;s card form opens here once sandbox access is ready.</p>
          </div>
        )}

        <FormError>{payError}</FormError>

        <div className="flex flex-col gap-2">
          <Button size="lg" variant="ember" className="w-full" disabled={busy} onClick={() => settle("paid")}>
            {busy ? "Confirming payment…" : method === "transfer" ? "I've sent the money" : `Pay ${formatNaira(data.amountKobo)}`}
          </Button>
          <button type="button" disabled={busy} onClick={() => settle("failed")} className="h-10 text-[13px] font-semibold text-muted hover:text-ink disabled:opacity-40">
            Simulate a failed payment
          </button>
        </div>
      </div>

      <Link href={`/videos/${video.id}`} className="text-center text-sm font-semibold text-muted hover:text-ink">
        Cancel and go back
      </Link>
    </div>
  );
}
