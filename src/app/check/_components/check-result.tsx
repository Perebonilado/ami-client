import { BadgeCheck, CircleAlert, CircleCheckBig, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { VideoThumb } from "@/components/video-thumb";
import { formatDate } from "@/lib/format";
import { platformLabel, labelForUseType } from "@/lib/pricing";
import type { LicenceCheck } from "@/lib/types";

export function CheckResult({ number, result }: { number: string; result: LicenceCheck }) {
  const l = result.licence;

  return (
    <div className="flex flex-col gap-5">
      <StatusBlock status={result.status} number={number} endsAt={l?.endsAt ?? null} />

      {l && (
        <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <VideoThumb thumbnailUrl={l.video.thumbnailUrl} poster={l.video.poster} title="" showPlay={false} className="aspect-[4/5] w-20 shrink-0 rounded-xl sm:w-24" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">Licensed video</span>
              <h2 className="text-lg leading-snug font-extrabold sm:text-xl">{l.video.title}</h2>
              <p className="flex items-center gap-1 text-sm text-muted">
                by <span className="font-semibold text-ink">{l.creator.name}</span>
                {l.creator.verified && <BadgeCheck size={15} className="shrink-0 text-ember" aria-label="Verified creator" />}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 divide-y divide-line rounded-2xl border border-line">
            <Row label="Licensed to">
              <span className="font-semibold">{l.buyer.businessName ?? l.buyer.name}</span>
              {l.buyer.businessName && <span className="block text-[13px] text-muted">{l.buyer.name}</span>}
            </Row>
            <Row label="Accounts covered">
              <span className="flex flex-wrap gap-1.5">
                {l.coveredAccounts.map((a) => (
                  <span key={a} className="rounded-full bg-sunken px-2.5 py-0.5 text-[13px] font-semibold ring-1 ring-line">
                    {a}
                  </span>
                ))}
              </span>
            </Row>
            <Row label="Use">{labelForUseType(l.useType)}</Row>
            <Row label="Platform">{platformLabel(l.platform)}</Row>
            <Row label="Starts">
              <span className="tabular">{formatDate(l.startsAt)}</span>
            </Row>
            <Row label="Ends">
              <span className="tabular">{l.endsAt ? formatDate(l.endsAt) : "Lifetime (no end date)"}</span>
            </Row>
            <Row label="Licence number">
              <span className="code font-semibold">{l.licenceNumber}</span>
            </Row>
          </dl>

          <p className="text-[13px] leading-relaxed text-muted">
            A licence only covers the accounts listed above. Posts from any other account aren&apos;t covered.
          </p>
        </section>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-3 px-4 py-3 text-[15px] sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-[13px] font-semibold text-muted sm:text-sm">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

function StatusBlock({ status, number, endsAt }: { status: LicenceCheck["status"]; number: string; endsAt: string | null }) {
  if (status === "valid") {
    return (
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-ok-wash px-6 py-8 text-center ring-1 ring-ok/15 sm:py-10">
        <span className="flex size-16 items-center justify-center rounded-full bg-ok text-white shadow-[0_12px_28px_-12px_var(--color-ok)] sm:size-20">
          <CircleCheckBig size={36} strokeWidth={2.25} aria-hidden />
        </span>
        <h1 className="text-4xl font-extrabold text-ok sm:text-5xl">Valid</h1>
        <p className="text-[15px] font-semibold text-ink">This licence is real and active.</p>
        <span className="code rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-ink">{number}</span>
      </section>
    );
  }
  if (status === "expired") {
    return (
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-bad-wash px-6 py-8 text-center ring-1 ring-bad/15 sm:py-10">
        <span className="flex size-16 items-center justify-center rounded-full bg-bad text-white sm:size-20">
          <CircleAlert size={36} strokeWidth={2.25} aria-hidden />
        </span>
        <h1 className="text-4xl font-extrabold text-bad sm:text-5xl">Expired</h1>
        <p className="max-w-sm text-[15px] font-semibold text-ink">
          This licence ended on <span className="tabular">{formatDate(endsAt)}</span>. Posts under it are no longer covered.
        </p>
        <span className="code rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-ink">{number}</span>
      </section>
    );
  }
  return (
    <section className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface px-6 py-8 text-center sm:py-10">
      <span className="flex size-16 items-center justify-center rounded-full bg-sunken text-muted ring-1 ring-line sm:size-20">
        <SearchX size={34} aria-hidden />
      </span>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Not found</h1>
      <p className="max-w-sm text-[15px] text-muted">
        No licence matches <span className="code font-semibold text-ink">{number}</span>. Check the number on the certificate and try again.
      </p>
    </section>
  );
}
