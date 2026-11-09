import { formatDuration, formatNaira } from "@/lib/format";
import type { Video } from "@/lib/types";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { VideoThumb } from "./video-thumb";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex min-w-0 flex-col gap-3 rounded-[22px] p-1.5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <VideoThumb thumbnailUrl={video.thumbnailUrl} poster={video.poster} title={video.title} className="aspect-[4/5] rounded-2xl">
        <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-semibold text-white tabular backdrop-blur">
          {formatDuration(video.durationSec)}
        </span>
      </VideoThumb>
      <div className="flex flex-col gap-1 px-1.5 pb-1.5">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-ink">{video.title}</h3>
        <p className="flex items-center gap-1 truncate text-[13px] text-muted">
          {video.creator.name}
          {video.creator.verified && <BadgeCheck size={14} className="shrink-0 text-ember" aria-label="Verified creator" />}
        </p>
        <p className="text-[13px] text-muted">
          {video.fromPriceKobo != null ? (
            <>
              from <span className="font-bold text-ink tabular">{formatNaira(video.fromPriceKobo)}</span>
            </>
          ) : (
            "Not licensing right now"
          )}
        </p>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-1.5" aria-hidden>
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-line" />
      <div className="flex flex-col gap-2 px-1.5">
        <div className="h-4 w-4/5 animate-pulse rounded bg-line" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-line" />
      </div>
    </div>
  );
}
