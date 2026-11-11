"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { Loading } from "@/components/loading";
import { openDownload } from "@/lib/download";
import { formatDate, formatNaira, formatPart, formatSeconds } from "@/lib/format";
import { durationLabel } from "@/lib/pricing";
import { useRequireUser } from "@/lib/use-require-user";
import { errorMessage, useGetLicenceQuery, useLazyDownloadLinkQuery } from "@/store/api";

export function LicenceView({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const user = useRequireUser(`/licences/${number}`);
  const { data, error } = useGetLicenceQuery(number, { skip: !user });
  const [getDownloadLink] = useLazyDownloadLinkQuery();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (error)
    return (
      <div className="empty">
        <h2>No licence with that number</h2>
        <p>Check the number, or find it in your library.</p>
        <Link href="/library?tab=bought" className="btn btn-ghost">
          My library
        </Link>
      </div>
    );
  if (!data) return <Loading label="Loading licence" />;

  const l = data.licence;
  const isBuyer = l.buyer.id === user?.id;
  const title =
    l.status === "pending"
      ? "Waiting for your payment"
      : l.status === "cancelled"
        ? "This checkout was cancelled"
        : l.status === "expired"
          ? "This licence has ended"
          : isBuyer
            ? "Your licence is ready"
            : "A licence for your video";
  const unpaid = l.status === "pending" || l.status === "cancelled";

  async function download() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const link = await getDownloadLink(l.licenceNumber).unwrap();
      openDownload(link.url);
    } catch (e) {
      setDownloadError(errorMessage(e, "We couldn’t start the download. Try again."));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="split2">
      <video className="media" muted loop autoPlay playsInline poster={l.video.thumbnailUrl ?? undefined} src={l.video.previewUrl} aria-label={l.video.title} />

      <div>
        <h1>{title}</h1>
        <dl className="rows">
          <div>
            <dt>Video</dt>
            <dd>
              {l.video.title}
              <span>by {l.video.creatorName}</span>
            </dd>
          </div>
          <div>
            <dt>Part</dt>
            <dd>
              {formatPart(l.part)}
              {l.part && <span>{formatSeconds(l.part.endSec - l.part.startSec)}</span>}
            </dd>
          </div>
          <div>
            <dt>How long</dt>
            <dd>
              {durationLabel(l.duration)}
              {l.endsAt && <span>{l.status === "expired" ? "ended" : "until"} {formatDate(l.endsAt)}</span>}
            </dd>
          </div>
          <div>
            <dt>Licence number</dt>
            <dd>{l.licenceNumber}</dd>
          </div>
          {!unpaid && (
            <div>
              <dt>{isBuyer ? "Paid" : "You earned"}</dt>
              <dd>{formatNaira(isBuyer ? l.priceKobo : l.creatorShareKobo)}</dd>
            </div>
          )}
        </dl>

        <div className="actions">
          {l.status === "active" && isBuyer && (
            <button type="button" className="btn btn-ink" onClick={download} disabled={downloading}>
              <Download aria-hidden />
              {downloading ? "Preparing…" : "Download video"}
            </button>
          )}
          {l.status === "expired" && isBuyer && (
            <Link href={`/videos/${l.video.id}`} className="btn btn-ink">
              License again
            </Link>
          )}
          {unpaid ? (
            <Link href={`/videos/${l.video.id}`} className="btn btn-ghost">
              Back to the video
            </Link>
          ) : (
            <Link href={`/licences/${l.licenceNumber}/certificate`} className="btn btn-ghost">
              View certificate
            </Link>
          )}
        </div>
        {downloadError && (
          <p className="form-err" role="alert">
            {downloadError}
          </p>
        )}
      </div>
    </div>
  );
}
