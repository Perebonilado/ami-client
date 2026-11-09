"use client";

import { ArrowLeft, BadgeCheck, Fingerprint } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { UnverifiedTag } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/page";
import { WatermarkedPlayer } from "@/components/watermarked-player";
import { api } from "@/lib/api";
import { formatDate, formatDuration, handle, shortHash } from "@/lib/format";
import { platformLabel } from "@/lib/pricing";
import { useApi } from "@/lib/use-api";
import { LicencePicker } from "./licence-picker";

export function VideoView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useApi(() => api.getVideo(id), [id]);

  if (loading && !data) return <Spinner label="Loading video" />;
  if (error || !data)
    return (
      <EmptyState title="This video isn't available" action={<LinkButton href="/browse" variant="secondary" size="sm">Browse videos</LinkButton>}>
        It may have been hidden by the creator, or the link is wrong.
      </EmptyState>
    );

  const video = data.video;
  return (
    <div className="flex flex-col gap-6">
      <Link href="/browse" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to browse
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <WatermarkedPlayer src={video.previewUrl} poster={video.thumbnailUrl ?? undefined} title={video.title} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-ink ring-1 ring-line">{video.category}</span>
              <span className="tabular">{formatDuration(video.durationSec)}</span>
              <span aria-hidden>·</span>
              <span>Listed {formatDate(video.createdAt)}</span>
            </div>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">{video.title}</h1>
            {video.description && <p className="max-w-2xl text-[16px] leading-relaxed text-muted">{video.description}</p>}
            {video.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {video.tags.map((t) => (
                  <li key={t}>
                    <Link href={`/browse?q=${encodeURIComponent(t)}`} className="rounded-full px-2 py-0.5 text-[13px] font-medium text-muted hover:bg-white hover:text-ink">
                      #{t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                {video.creator.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-bold">
                  {video.creator.name}
                  {video.creator.verified && <BadgeCheck size={16} className="text-ember" aria-label="Verified by Àmì" />}
                </p>
                <p className="text-[13px] text-muted">{video.creator.verified ? "Verified by Àmì" : "Creator"}</p>
              </div>
            </div>
            {video.creator.socialAccounts.length > 0 && (
              <ul className="flex flex-col divide-y divide-line border-t border-line">
                {video.creator.socialAccounts.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-muted">{platformLabel(s.platform)}</span>
                    <span className="flex items-center gap-2 font-semibold">
                      {handle(s.handle)} {!s.verified && <UnverifiedTag />}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="flex items-start gap-2 rounded-2xl bg-sunken p-3 text-[13px] leading-relaxed text-muted">
              <Fingerprint size={16} className="mt-0.5 shrink-0 text-ink" />
              <span>
                Registered file fingerprint <span className="code font-semibold text-ink">{shortHash(video.fileSha256)}</span>, recorded {formatDate(video.createdAt)}.
              </span>
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <LicencePicker video={video} />
        </div>
      </div>
    </div>
  );
}
