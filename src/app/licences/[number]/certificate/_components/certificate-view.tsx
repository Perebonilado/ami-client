"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { use, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth-provider";
import { AmiMark } from "@/components/logo";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/page";
import { api } from "@/lib/api";
import { formatDate, shortHash } from "@/lib/format";
import { USE_TYPES, durationLabel, platformLabel, labelForUseType } from "@/lib/pricing";
import { useApi } from "@/lib/use-api";

// The QR code must point at the public site, so judges' phones can open it.
// Set NEXT_PUBLIC_SITE_URL to the deployed URL; locally it falls back to this browser's origin.
function useSiteUrl() {
  return useSyncExternalStore(
    () => () => {},
    () => process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin,
    () => process.env.NEXT_PUBLIC_SITE_URL ?? "",
  );
}

/**
 * Printable certificate. "Download PDF" uses the browser's Save as PDF.
 * The backend's generated PDF (spec: PDF + QR library) can replace this later with the same layout.
 */
export function CertificateView({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const { user, ready } = useAuth();
  const router = useRouter();
  const siteUrl = useSiteUrl();
  const licenceQ = useApi(() => (user ? api.getLicence(number) : Promise.reject(new Error("login"))), [number, user?.id]);
  const videoId = licenceQ.data?.licence.video.id;
  const videoQ = useApi(() => (videoId ? api.getVideo(videoId) : Promise.resolve(null)), [videoId]);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/licences/${number}/certificate`);
  }, [ready, user, router, number]);

  if (!ready || (licenceQ.loading && !licenceQ.data)) return <Spinner label="Preparing certificate" />;
  if (licenceQ.error || !licenceQ.data)
    return (
      <div className="w-full max-w-lg">
        <EmptyState title="No licence with that number" action={<LinkButton href="/library?tab=licences" variant="secondary" size="sm">My licences</LinkButton>} />
      </div>
    );

  const l = licenceQ.data.licence;
  const sha = videoQ.data?.video.fileSha256;
  const checkUrl = `${siteUrl}/check/${l.licenceNumber}`;
  const allows = USE_TYPES.find((u) => u.value === l.useType)?.allows;

  return (
    <div className="flex w-full max-w-[820px] flex-col gap-4">
      <div className="no-print flex items-center justify-between gap-3">
        <Link href={`/licences/${l.licenceNumber}`} className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft size={16} /> Back to licence
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          <Printer size={16} /> Download PDF
        </Button>
      </div>

      <article className="relative overflow-hidden rounded-[28px] border border-line bg-white p-8 shadow-float sm:p-12 print:rounded-none print:border-0 print:shadow-none">
        <div className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full border-[28px] border-ember/8" aria-hidden />

        <header className="flex items-start justify-between gap-6 border-b border-line pb-8">
          <div className="flex items-center gap-3">
            <AmiMark size={40} />
            <div>
              <p className="text-2xl font-extrabold tracking-tight">Àmì</p>
              <p className="text-[13px] text-muted">Licence certificate</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Licence number</p>
            <p className="code text-xl font-bold">{l.licenceNumber}</p>
          </div>
        </header>

        <div className="grid gap-10 pt-8 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[13px] text-muted">This certifies that</p>
              <p className="text-2xl font-bold">{l.buyer.businessName ?? l.buyer.name}</p>
              <p className="mt-2 text-[13px] text-muted">is licensed to use</p>
              <p className="text-xl leading-snug font-bold">&ldquo;{l.video.title}&rdquo;</p>
              <p className="text-[15px] text-muted">by {l.video.creatorName}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                ["Licence type", labelForUseType(l.useType)],
                ["Platform", platformLabel(l.platform)],
                ["Accounts covered", l.coveredAccounts.join(", ")],
                ["Duration", durationLabel(l.duration)],
                ["Valid from", formatDate(l.startsAt)],
                ["Valid until", l.endsAt ? formatDate(l.endsAt) : "No end date (lifetime)"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <div className="rounded-2xl border border-line p-3">
              {siteUrl ? <QRCodeSVG value={checkUrl} size={148} level="M" marginSize={0} fgColor="#141014" /> : <div className="size-[148px]" />}
            </div>
            <p className="max-w-[180px] text-center text-[12px] leading-snug text-muted sm:text-right">Scan to confirm this licence is real and active.</p>
          </div>
        </div>

        <section className="mt-8 flex flex-col gap-2 rounded-2xl bg-sunken p-5 text-[13px] leading-relaxed text-muted">
          <p>
            <span className="font-semibold text-ink">What this allows: </span>
            {allows}.
          </p>
          <p>Only the accounts named above are covered. Posting from another account isn&apos;t covered by this licence.</p>
          {sha && (
            <p>
              Registered file fingerprint (SHA-256): <span className="code text-ink">{shortHash(sha)}</span>
            </p>
          )}
        </section>

        <footer className="mt-8 flex flex-col gap-1 border-t border-line pt-6 text-[12px] text-muted sm:flex-row sm:justify-between">
          <span>Issued by Àmì on {formatDate(l.startsAt)}</span>
          <span className="code">{checkUrl.replace(/^https?:\/\//, "")}</span>
        </footer>
      </article>
    </div>
  );
}
