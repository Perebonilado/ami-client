"use client";

import { ChevronRight, Download, FileBadge, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LicenceStatusBadge, VideoStatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Container, EmptyState, PageHeader, Spinner, Stat } from "@/components/ui/page";
import { Tab, TabsList, TabsPanel, TabsRoot } from "@/components/ui/tabs";
import { VideoThumb } from "@/components/video-thumb";
import { api } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/format";
import { durationLabel, platformLabel, labelForUseType } from "@/lib/pricing";
import type { Library, Licence, MyVideo } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { useRequireUser } from "./require-user";
import { SalesTable } from "./sales-table";

type TabValue = "videos" | "licences";

export function LibraryView() {
  const user = useRequireUser("/library");
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="My library"
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : "My library"}
        description="Your videos, what they've earned, and the licences you've bought."
        actions={
          <LinkButton href="/upload">
            <Upload size={16} /> Upload a video
          </LinkButton>
        }
      />
      {user ? <LibraryContent /> : <Spinner label="Loading your library" />}
    </Container>
  );
}

function LibraryContent() {
  const { data, error, loading } = useApi(() => api.library());
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabValue>(searchParams.get("tab") === "licences" ? "licences" : "videos");

  if (loading && !data) return <Spinner label="Loading your library" />;
  if (error || !data) {
    return <EmptyState title="We couldn't load your library">{error?.message ?? "Refresh the page to try again."}</EmptyState>;
  }

  const { totals } = data;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Videos" value={totals.videos} />
        <Stat label="Licences sold" value={totals.licencesSold} />
        <Stat label="Earnings" value={formatNaira(totals.earningsKobo)} hint="After Àmì's 15% fee" />
        <Stat label="Pending payout" value={formatNaira(totals.pendingPayoutKobo)} hint="Pays out after the hackathon" />
      </div>

      <TabsRoot
        value={tab}
        onValueChange={(v) => {
          const next = v as TabValue;
          setTab(next);
          router.replace(next === "licences" ? "/library?tab=licences" : "/library", { scroll: false });
        }}
        className="flex flex-col gap-6"
      >
        <TabsList className="self-start">
          <Tab value="videos">
            My videos <span className="tabular opacity-70">{data.videos.length}</span>
          </Tab>
          <Tab value="licences">
            My licences <span className="tabular opacity-70">{data.licences.length}</span>
          </Tab>
        </TabsList>

        <TabsPanel value="videos" className="flex flex-col gap-10">
          <MyVideos library={data} />
        </TabsPanel>
        <TabsPanel value="licences">
          <MyLicences licences={data.licences} />
        </TabsPanel>
      </TabsRoot>
    </div>
  );
}

function MyVideos({ library }: { library: Library }) {
  if (!library.videos.length) {
    return (
      <EmptyState
        title="You haven't uploaded a video yet"
        action={
          <LinkButton href="/upload" size="sm">
            Upload a video
          </LinkButton>
        }
      >
        Upload a skit, set your licence prices, and pages and brands can pay you in naira to use it.
      </EmptyState>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Videos</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold tracking-[0.08em] text-muted uppercase">
                <th className="px-4 py-3 font-bold">Video</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Licences sold</th>
                <th className="px-4 py-3 text-right font-bold">Earnings</th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {library.videos.map((v) => (
                <VideoRow key={v.id} video={v} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-extrabold">Sales</h2>
          <span className="text-[13px] text-muted">{library.sales.length} licences</span>
        </div>
        {library.sales.length ? (
          <SalesTable sales={library.sales} />
        ) : (
          <EmptyState title="No sales yet">When a page or brand licenses one of your videos, it shows up here with the accounts it covers and when it expires.</EmptyState>
        )}
      </section>
    </>
  );
}

function VideoRow({ video }: { video: MyVideo }) {
  const href = `/library/videos/${video.id}`;
  return (
    <tr className="group transition-colors hover:bg-sunken/70">
      <td className="px-4 py-3">
        <Link href={href} className="flex items-center gap-3.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {/* title is left empty so the small thumb doesn't render the poster headline */}
          <VideoThumb thumbnailUrl={video.thumbnailUrl} poster={video.poster} title="" showPlay={false} className="aspect-[4/5] w-12 shrink-0 rounded-lg" />
          <span className="flex min-w-0 flex-col">
            <span className="line-clamp-1 font-semibold text-ink group-hover:underline">{video.title}</span>
            <span className="text-[12px] text-muted">
              {video.category} · uploaded {formatDate(video.createdAt)}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <VideoStatusBadge status={video.status} />
      </td>
      <td className="px-4 py-3 text-right font-semibold text-ink tabular">{video.licencesSold}</td>
      <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-ink tabular">{formatNaira(video.earningsKobo)}</td>
      <td className="px-4 py-3 text-right">
        <Link href={href} aria-label={`Edit ${video.title}`} className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink">
          <ChevronRight size={18} />
        </Link>
      </td>
    </tr>
  );
}

function MyLicences({ licences }: { licences: Licence[] }) {
  if (!licences.length) {
    return (
      <EmptyState
        title="You haven't licensed any videos yet"
        action={
          <LinkButton href="/browse" size="sm">
            Browse videos
          </LinkButton>
        }
      >
        Find a skit for your page or brand, pay in naira, and get a clean file plus a certificate anyone can check.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {licences.map((l) => (
        <li key={l.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <VideoThumb thumbnailUrl={l.video.thumbnailUrl} poster={l.video.poster} title="" showPlay={false} className="aspect-[4/5] w-14 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="line-clamp-1 font-bold text-ink">{l.video.title}</p>
                <LicenceStatusBadge status={l.status} />
              </div>
              <p className="text-[13px] text-muted">
                by {l.video.creatorName} · {labelForUseType(l.useType)} · {platformLabel(l.platform)} · {durationLabel(l.duration)}
              </p>
              <p className="text-[13px] text-muted">
                <span className="code text-ink">{l.licenceNumber}</span>
                {" · "}
                {l.endsAt ? (
                  <>
                    {l.status === "expired" ? "Expired" : "Expires"} <span className="text-ink tabular">{formatDate(l.endsAt)}</span>
                  </>
                ) : (
                  "Lifetime licence"
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <LinkButton href={`/licences/${l.licenceNumber}`} variant="secondary" size="sm">
              <Download size={15} /> Licence & download
            </LinkButton>
            <LinkButton href={`/licences/${l.licenceNumber}/certificate`} variant="secondary" size="sm">
              <FileBadge size={15} /> Certificate
            </LinkButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
