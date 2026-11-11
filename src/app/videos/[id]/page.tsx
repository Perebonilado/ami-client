import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { VideoView } from "./_components/video-view";
import "./video.css";

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-video">
      <Suspense fallback={<Loading label="Loading video" />}>
        <VideoView params={params} />
      </Suspense>
    </div>
  );
}
