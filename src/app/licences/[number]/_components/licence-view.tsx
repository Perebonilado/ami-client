"use client";

import { CheckCircle2, Copy, Download, FileBadge2, ScanLine } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LicenceStatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { EmptyState, Spinner } from "@/components/ui/page";
import { VideoThumb } from "@/components/video-thumb";
import { api } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/format";
import { USE_TYPES, durationLabel, platformLabel, labelForUseType } from "@/lib/pricing";
import { useApi } from "@/lib/use-api";

export function LicenceView({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const justPaid = useSearchParams().get("paid") === "1";
  const { user, ready } = useAuth();
  const router = useRouter();
  const { data, error, loading } = useApi(() => (user ? api.getLicence(number) : Promise.reject(new Error("login"))), [number, user?.id]);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/licences/${number}`);
  }, [ready, user, router, number]);

  if (!ready || (loading && !data)) return <Spinner label="Loading licence" />;
  if (error || !data)
    return (
      <EmptyState title="No licence with that number" action={<LinkButton href="/library?tab=licences" variant="secondary" size="sm">My licences</LinkButton>}>
        Check the number, or find it in your library.
      </EmptyState>
    );

  const l = data.licence;
  const isBuyer = l.buyer.id === user?.id;
  const allows = USE_TYPES.find((u) => u.value === l.useType)?.allows;
  const checkPath = `/check/${l.licenceNumber}`;

  async function download() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const link = await api.downloadLink(l.licenceNumber);
      const a = document.createElement("a");
      a.href = link.url;
      a.download = `${l.video.title} (${l.licenceNumber}).mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Couldn't start the download.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyCheckLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${checkPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the link is visible on the page */
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {justPaid && l.status === "active" && (
        <div className="flex items-start gap-3 rounded-3xl border border-ok/20 bg-ok-wash p-5 text-ok">
          <CheckCircle2 size={24} className="shrink-0" />
          <div>
            <p className="text-lg font-bold">Payment confirmed. Your licence is active.</p>
            <p className="text-[15px] text-ok/80">Download the clean file and keep the certificate. It&apos;s also saved in My licences.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.12em] text-muted uppercase">Licence number</span>
            <span className="code text-2xl font-bold">{l.licenceNumber}</span>
          </div>
          <LicenceStatusBadge status={l.status} />
        </div>

        <div className="flex gap-4">
          <VideoThumb thumbnailUrl={l.video.thumbnailUrl} poster={l.video.poster} title="" showPlay={false} className="h-28 w-[5.6rem] shrink-0 rounded-2xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <Link href={`/videos/${l.video.id}`} className="text-lg leading-snug font-bold hover:underline">
              {l.video.title}
            </Link>
            <p className="text-sm text-muted">by {l.video.creatorName}</p>
            <p className="mt-1 text-sm text-muted">{allows}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
          {[
            ["Licence type", labelForUseType(l.useType)],
            ["Platform", platformLabel(l.platform)],
            ["Duration", durationLabel(l.duration)],
            ["Covers", l.coveredAccounts.join(", ")],
            ["Starts", formatDate(l.startsAt)],
            ["Ends", l.endsAt ? formatDate(l.endsAt) : "Never (lifetime)"],
            ["Licensed to", l.buyer.businessName ?? l.buyer.name],
            ["Paid", formatNaira(l.priceKobo)],
          ].map(([k, v]) => (
            <div key={k} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-muted">{k}</dt>
              <dd className="font-semibold break-words">{v}</dd>
            </div>
          ))}
        </dl>

        {isBuyer && (
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" onClick={download} disabled={downloading || l.status !== "active"} className="sm:flex-1">
                <Download size={18} /> {downloading ? "Preparing file…" : "Download video"}
              </Button>
              <LinkButton href={`/licences/${l.licenceNumber}/certificate`} variant="secondary" size="lg" className="sm:flex-1">
                <FileBadge2 size={18} /> Download certificate
              </LinkButton>
            </div>
            {l.status !== "active" && <p className="text-[13px] text-muted">Downloads are only available while the licence is active.</p>}
            <FormError>{downloadError}</FormError>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ScanLine size={20} className="mt-0.5 shrink-0 text-ember" />
          <div className="text-sm">
            <p className="font-bold">Anyone can check this licence</p>
            <p className="text-muted">
              The certificate&apos;s QR code opens <Link href={checkPath} className="code font-semibold text-ink underline">{checkPath}</Link>
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={copyCheckLink}>
          <Copy size={14} /> {copied ? "Copied" : "Copy check link"}
        </Button>
      </div>
    </div>
  );
}
