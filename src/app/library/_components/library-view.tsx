"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ClipCard, Still } from "@/components/clip-card";
import { Loading } from "@/components/loading";
import { openDownload } from "@/lib/download";
import { formatDate, formatNaira, formatPart } from "@/lib/format";
import { durationPhrase } from "@/lib/pricing";
import type { Library, Licence, MyVideo, Sale } from "@/lib/types";
import { useRequireUser } from "@/lib/use-require-user";
import { errorMessage, useLazyDownloadLinkQuery, useLibraryQuery } from "@/store/api";

type Tab = "videos" | "sales" | "bought";
const licences = (n: number) => `${n} ${n === 1 ? "licence" : "licences"}`;

export function LibraryView() {
  const user = useRequireUser("/library");
  const { data, error } = useLibraryQuery(undefined, { skip: !user });
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  if (error)
    return (
      <div className="empty">
        <h2>We couldn’t load your library</h2>
        <p>{errorMessage(error)}</p>
      </div>
    );
  if (!data) return <Loading label="Loading your library" />;

  const asked = params.get("tab") as Tab | null;
  const tab: Tab = asked && ["videos", "sales", "bought"].includes(asked) ? asked : data.videos.length || !data.licences.length ? "videos" : "bought";
  const pick = (t: Tab) => router.replace(`${pathname}?tab=${t}`, { scroll: false });

  const tabs: { id: Tab; label: string }[] = [
    { id: "videos", label: `Videos (${data.videos.length})` },
    { id: "sales", label: `Sales (${data.sales.length})` },
    { id: "bought", label: `Bought (${data.licences.length})` },
  ];

  return (
    <>
      <div className="head">
        <div>
          <h1 className="page-title">My library</h1>
          {data.videos.length > 0 && (
            <p className="earned">
              <b>{formatNaira(data.totals.earningsKobo)}</b> earned from <b>{licences(data.totals.licencesSold)}</b>
            </p>
          )}
        </div>
        <Link className="btn btn-ink" href="/upload">
          <Upload aria-hidden />
          Upload a video
        </Link>
      </div>

      <div
        className="tabs"
        role="tablist"
        aria-label="Library"
        onKeyDown={(e) => {
          const i = tabs.findIndex((t) => t.id === tab);
          const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const next = tabs[(i + step + tabs.length) % tabs.length].id;
          pick(next);
          requestAnimationFrame(() => document.getElementById(`t-${next}`)?.focus());
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`t-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`p-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => pick(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="panel" role="tabpanel" id={`p-${tab}`} aria-labelledby={`t-${tab}`}>
        {tab === "videos" && <Videos videos={data.videos} />}
        {tab === "sales" && <Sales sales={data.sales} />}
        {tab === "bought" && <Bought licences={data.licences} />}
      </section>
    </>
  );
}

function Videos({ videos }: { videos: MyVideo[] }) {
  if (videos.length === 0)
    return (
      <div className="empty">
        <h2>No videos yet</h2>
        <p>Upload a video and other creators can license it.</p>
        <Link className="btn btn-ghost" href="/upload">
          Upload a video
        </Link>
      </div>
    );

  return (
    <div className="cards">
      {videos.map((v) => {
        const off = v.status !== "live";
        return (
          <ClipCard
            key={v.id}
            href={`/videos/${v.id}`}
            title={v.title}
            subtitle={v.licencesSold ? `${licences(v.licencesSold)} · ${formatNaira(v.earningsKobo)}` : "No licences yet"}
            durationSec={v.durationSec}
            thumbnailUrl={v.thumbnailUrl}
            poster={v.poster}
            previewUrl={v.previewUrl}
            muted={off}
            badge={off ? <span className="badge-quiet">{v.status === "under_review" ? "In review" : "Hidden"}</span> : null}
          />
        );
      })}
    </div>
  );
}

function Sales({ sales }: { sales: Library["sales"] }) {
  if (sales.length === 0)
    return (
      <div className="empty">
        <h2>No sales yet</h2>
        <p>When someone licenses one of your videos, it shows up here.</p>
      </div>
    );

  return (
    <ul className="list sales">
      {sales.map((s: Sale) => (
        <li key={s.licenceNumber}>
          <div className="pic">
            <Still thumbnailUrl={s.videoThumbnailUrl} poster={s.videoPoster} />
          </div>
          <div className="t">
            <Link href={`/licences/${s.licenceNumber}`}>
              <b>{s.videoTitle}</b>
            </Link>
            <span>
              {s.buyerBusinessName ?? s.buyerName} · {formatDate(s.startsAt)}
            </span>
          </div>
          <span className="what">
            {formatPart(s.part)} · {durationPhrase(s.duration)}
          </span>
          <span className="amt">{formatNaira(s.creatorShareKobo)}</span>
        </li>
      ))}
    </ul>
  );
}

function Bought({ licences: items }: { licences: Licence[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [getDownloadLink] = useLazyDownloadLinkQuery();

  if (items.length === 0)
    return (
      <div className="empty">
        <h2>Nothing bought yet</h2>
        <p>Licences you buy show up here with their downloads and certificates.</p>
        <Link className="btn btn-ghost" href="/browse">
          Browse videos
        </Link>
      </div>
    );

  const download = async (l: Licence) => {
    setBusy(l.licenceNumber);
    setError(null);
    try {
      const link = await getDownloadLink(l.licenceNumber).unwrap();
      openDownload(link.url);
    } catch (e) {
      setError(errorMessage(e, "We couldn’t start the download. Try again."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <ul className="list">
        {items.map((l) => (
          <li key={l.licenceNumber}>
            <div className="pic">
              <Still thumbnailUrl={l.video.thumbnailUrl} poster={l.video.poster} />
            </div>
            <div className="t">
              <Link href={`/licences/${l.licenceNumber}`}>
                <b>{l.video.title}</b>
              </Link>
              <span>by {l.video.creatorName}</span>
            </div>
            <span className="what">
              {formatPart(l.part)} · {l.status === "expired" ? `ended ${formatDate(l.endsAt)}` : l.endsAt ? `until ${formatDate(l.endsAt)}` : "forever"}
            </span>
            <span className="acts">
              {l.status === "active" && (
                <button className="btn btn-ink" type="button" onClick={() => download(l)} disabled={busy === l.licenceNumber}>
                  {busy === l.licenceNumber ? "Preparing…" : "Download"}
                </button>
              )}
              <Link className="btn btn-ghost" href={`/licences/${l.licenceNumber}/certificate`}>
                Certificate
              </Link>
            </span>
          </li>
        ))}
      </ul>
      {error && (
        <p className="form-err dl-err" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
