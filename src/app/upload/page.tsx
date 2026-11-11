import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { UploadView } from "./_components/upload-view";
import "./upload.css";

export const metadata: Metadata = { title: "Upload a video" };

export default function UploadPage() {
  return (
    <div className="p-upload wrap page">
      <Suspense fallback={<Loading />}>
        <UploadView />
      </Suspense>
    </div>
  );
}
