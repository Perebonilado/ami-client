"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { use, useSyncExternalStore } from "react";
import { Loading } from "@/components/loading";
import { Wordmark } from "@/components/logo";
import { formatDate, formatPart, formatSeconds } from "@/lib/format";
import { useRequireUser } from "@/lib/use-require-user";
import { useGetLicenceQuery } from "@/store/api";

// The QR code must point at the public site so anyone's phone can open it.
// Set NEXT_PUBLIC_SITE_URL to the deployed URL; locally it falls back to this browser's origin.
function useSiteUrl() {
  return useSyncExternalStore(
    () => () => {},
    () => process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin,
    () => process.env.NEXT_PUBLIC_SITE_URL ?? "",
  );
}

/** Printable certificate. "Save as PDF" uses the browser's print dialog. */
export function CertificateView({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const user = useRequireUser(`/licences/${number}/certificate`);
  const siteUrl = useSiteUrl();
  const { data, error } = useGetLicenceQuery(number, { skip: !user });

  if (error || (data && data.licence.status !== "active" && data.licence.status !== "expired"))
    return (
      <div className="empty">
        <h2>{error ? "No licence with that number" : "This licence isn’t paid for yet"}</h2>
        <p>{error ? "Check the number, or find it in your library." : "The certificate is ready once the payment goes through."}</p>
        <Link href="/library?tab=bought" className="btn btn-ghost">
          My library
        </Link>
      </div>
    );
  if (!data) return <Loading label="Preparing certificate" />;

  const l = data.licence;
  const checkUrl = `${siteUrl}/check/${l.licenceNumber}`;

  return (
    <>
      <div className="bar no-print">
        <Link className="back" href={`/licences/${l.licenceNumber}`}>
          <ArrowLeft aria-hidden />
          Your licence
        </Link>
        <button className="btn btn-ink btn-sm" type="button" onClick={() => print()}>
          <Download aria-hidden />
          Save as PDF
        </button>
      </div>

      <article className="sheet" aria-label="Licence certificate">
        <Wordmark />
        <h1>Licence certificate</h1>
        <p className="num">{l.licenceNumber}</p>

        <dl className="facts">
          <div>
            <dt>Video</dt>
            <dd>{l.video.title}</dd>
          </div>
          <div>
            <dt>Made by</dt>
            <dd>{l.video.creatorName}</dd>
          </div>
          <div>
            <dt>Licensed to</dt>
            <dd>{l.buyer.businessName ?? l.buyer.name}</dd>
          </div>
          <div>
            <dt>Part</dt>
            <dd>{l.part ? `${formatPart(l.part)} (${formatSeconds(l.part.endSec - l.part.startSec)})` : "Whole video"}</dd>
          </div>
          <div>
            <dt>Valid from</dt>
            <dd>{formatDate(l.startsAt)}</dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>{l.endsAt ? formatDate(l.endsAt) : "Forever"}</dd>
          </div>
        </dl>

        <div className="proof">
          <div className="qr">{siteUrl && <QRCodeSVG value={checkUrl} level="M" marginSize={0} aria-label="QR code that opens the licence check" />}</div>
          <div>
            <b>Scan to check this licence</b>
            <span>{checkUrl.replace(/^https?:\/\//, "")}</span>
          </div>
          <p className="issued">Issued {formatDate(l.startsAt)}</p>
        </div>
      </article>
    </>
  );
}
