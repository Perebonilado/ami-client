import type { CheckStatus, LicenceStatus, PaymentStatus, VideoStatus } from "@/lib/types";
import type { ReactNode } from "react";

type Tone = "ok" | "warn" | "bad" | "neutral" | "ember";

const tones: Record<Tone, string> = {
  ok: "bg-ok-wash text-ok",
  warn: "bg-warn-wash text-warn",
  bad: "bg-bad-wash text-bad",
  neutral: "bg-sunken text-muted ring-1 ring-line",
  ember: "bg-ember-wash text-ember-ink",
};

export function Badge({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function VideoStatusBadge({ status }: { status: VideoStatus }) {
  if (status === "live") return <Badge tone="ok">Live</Badge>;
  if (status === "hidden") return <Badge tone="neutral">Hidden</Badge>;
  return <Badge tone="warn">Under review</Badge>;
}

export function LicenceStatusBadge({ status }: { status: LicenceStatus }) {
  if (status === "active") return <Badge tone="ok">Active</Badge>;
  if (status === "expired") return <Badge tone="neutral">Expired</Badge>;
  if (status === "cancelled") return <Badge tone="neutral">Cancelled</Badge>;
  return <Badge tone="warn">Awaiting payment</Badge>;
}

export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  if (status === "valid") return <Badge tone="ok">Valid</Badge>;
  if (status === "expired") return <Badge tone="bad">Expired</Badge>;
  return <Badge tone="neutral">Not found</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "paid" || status === "overpaid") return <Badge tone="ok">Paid</Badge>;
  if (status === "failed") return <Badge tone="bad">Failed</Badge>;
  if (status === "partial") return <Badge tone="warn">Part paid</Badge>;
  return <Badge tone="warn">Waiting</Badge>;
}

export function UnverifiedTag() {
  return <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold tracking-wide text-faint uppercase ring-1 ring-line">Unverified</span>;
}
