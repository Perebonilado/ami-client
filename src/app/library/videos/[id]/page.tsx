import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/page";
import { EditVideo } from "../../_components/edit-video";

export const metadata: Metadata = { title: "Edit video" };

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Spinner label="Loading video" />}>
      <EditVideo params={params} />
    </Suspense>
  );
}
