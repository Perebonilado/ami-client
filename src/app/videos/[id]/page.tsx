import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { VideoView } from "./_components/video-view";

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Container className="py-8 sm:py-12">
      <Suspense fallback={<Spinner label="Loading video" />}>
        <VideoView params={params} />
      </Suspense>
    </Container>
  );
}
