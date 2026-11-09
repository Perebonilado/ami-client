import type { Metadata } from "next";
import { UploadForm } from "./_components/upload-form";

export const metadata: Metadata = { title: "Upload a video" };

export default function UploadPage() {
  return <UploadForm />;
}
