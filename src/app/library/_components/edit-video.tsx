"use client";

import { ArrowLeft, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { VideoStatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { FormError, TextAreaField, TextField } from "@/components/ui/field";
import { Container, EmptyState, Panel, Spinner } from "@/components/ui/page";
import { VideoThumb } from "@/components/video-thumb";
import { ApiError, api } from "@/lib/api";
import { formatDate, formatDuration, formatNaira, shortHash } from "@/lib/format";
import type { Video, VideoPrice } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { PriceEditor } from "./price-editor";
import { useRequireUser } from "./require-user";
import { SalesTable } from "./sales-table";

export function EditVideo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useRequireUser(`/library/videos/${id}`);
  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <Link href="/library" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> My library
      </Link>
      {user ? <EditVideoLoader id={id} userId={user.id} /> : <Spinner label="Loading video" />}
    </Container>
  );
}

function EditVideoLoader({ id, userId }: { id: string; userId: string }) {
  const { data, error, loading, setData } = useApi(() => api.getVideo(id), [id]);

  if (loading && !data) return <Spinner label="Loading video" />;
  if (error || !data) {
    return (
      <EmptyState
        title="We couldn't load this video"
        action={
          <LinkButton href="/library" size="sm" variant="secondary">
            Back to my library
          </LinkButton>
        }
      >
        {error?.message ?? "It may have been removed."}
      </EmptyState>
    );
  }
  if (data.video.creator.id !== userId) {
    return (
      <EmptyState
        title="Only the creator can edit this video"
        action={
          <LinkButton href={`/videos/${data.video.id}`} size="sm" variant="secondary">
            View the video
          </LinkButton>
        }
      >
        You can license it from its public page instead.
      </EmptyState>
    );
  }
  return <EditForm key={data.video.id} video={data.video} onSaved={(video) => setData({ video })} />;
}

function EditForm({ video, onSaved }: { video: Video; onSaved: (v: Video) => void }) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [prices, setPrices] = useState<VideoPrice[]>(video.prices);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noneEnabled = !prices.some((p) => p.enabled && p.basePriceKobo > 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const { video: updated } = await api.updateVideo(video.id, { title, description, prices });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility() {
    setError(null);
    setToggling(true);
    try {
      const { video: updated } = await api.updateVideo(video.id, { status: video.status === "live" ? "hidden" : "live" });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change this video's visibility. Try again.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">Edit video</span>
        <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{video.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={save} className="flex min-w-0 flex-col gap-6">
          <Panel className="flex flex-col gap-5 p-5 sm:p-6">
            <h2 className="text-lg font-extrabold">Details</h2>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
            <TextAreaField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={1000} />
          </Panel>

          <Panel className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-extrabold">Licence prices</h2>
              <p className="text-[14px] text-muted">
                Set one base price per licence type. Longer licences and all-platform licences cost more automatically. Switch a type off to stop offering it.
              </p>
            </div>
            <PriceEditor prices={prices} onChange={setPrices} />
          </Panel>

          <FormError>{error}</FormError>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving || noneEnabled || !title.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm font-semibold text-ok">Saved</span>}
            {noneEnabled && <span className="text-sm text-muted">Keep at least one licence type switched on with a price.</span>}
          </div>
        </form>

        <aside className="flex min-w-0 flex-col gap-4">
          <Panel className="flex flex-col gap-4 p-4">
            <VideoThumb thumbnailUrl={video.thumbnailUrl} poster={video.poster} title={video.title} className="aspect-[4/5] w-full rounded-2xl" />
            <div className="flex items-center justify-between gap-3">
              <VideoStatusBadge status={video.status} />
              <span className="text-[13px] text-muted tabular">{formatDuration(video.durationSec)}</span>
            </div>
            {video.status === "under_review" ? (
              <p className="rounded-xl bg-warn-wash px-3.5 py-3 text-[13px] text-warn">
                The Àmì team is reviewing this video. It isn&apos;t on the browse page until they finish.
              </p>
            ) : (
              <Button variant="secondary" size="sm" onClick={toggleVisibility} disabled={toggling}>
                {video.status === "live" ? (
                  <>
                    <EyeOff size={15} /> {toggling ? "Hiding…" : "Hide from browse"}
                  </>
                ) : (
                  <>
                    <Eye size={15} /> {toggling ? "Publishing…" : "Show on browse"}
                  </>
                )}
              </Button>
            )}
            <LinkButton href={`/videos/${video.id}`} variant="ghost" size="sm">
              <ExternalLink size={15} /> View public page
            </LinkButton>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px]">
              <dt className="text-muted">Uploaded</dt>
              <dd className="text-right text-ink">{formatDate(video.createdAt)}</dd>
              <dt className="text-muted">Category</dt>
              <dd className="text-right text-ink">{video.category}</dd>
              <dt className="text-muted">From</dt>
              <dd className="text-right font-semibold text-ink tabular">{video.fromPriceKobo != null ? formatNaira(video.fromPriceKobo) : "Not licensing"}</dd>
              <dt className="text-muted">Fingerprint</dt>
              <dd className="code truncate text-right text-ink" title={video.fileSha256}>
                {shortHash(video.fileSha256)}
              </dd>
            </dl>
          </Panel>
        </aside>
      </div>

      <VideoSales videoId={video.id} />
    </div>
  );
}

function VideoSales({ videoId }: { videoId: string }) {
  const { data, loading } = useApi(() => api.library(), [videoId]);
  const sales = data?.sales.filter((s) => s.videoId === videoId) ?? [];
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-extrabold">Sales of this video</h2>
        {data && <span className="text-[13px] text-muted">{sales.length} licences</span>}
      </div>
      {loading && !data ? (
        <Spinner label="Loading sales" />
      ) : sales.length ? (
        <SalesTable sales={sales} showVideo={false} />
      ) : (
        <EmptyState title="No sales yet">When someone licenses this video, you&apos;ll see who, for which account, and when it expires.</EmptyState>
      )}
    </section>
  );
}
