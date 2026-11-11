import type { Metadata } from "next";
import { UploadView } from "./_components/upload-view";
import "./upload.css";

export const metadata: Metadata = { title: "Upload a video" };

export default function UploadPage() {
  return (
    <div className="p-upload wrap page">
      <UploadView />
    </div>
  );
}
