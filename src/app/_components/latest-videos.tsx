"use client";

import { VideoCard, VideoCardSkeleton } from "@/components/video-card";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

export function LatestVideos() {
  const { data, error } = useApi(() => api.listVideos());
  if (error) return <p className="text-sm text-muted">Couldn&apos;t load videos right now.</p>;
  const videos = data?.videos.slice(0, 8);
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {videos ? videos.map((v) => <VideoCard key={v.id} video={v} />) : Array.from({ length: 8 }, (_, i) => <VideoCardSkeleton key={i} />)}
    </div>
  );
}
