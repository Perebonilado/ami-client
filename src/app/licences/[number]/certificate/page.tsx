import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { CertificateView } from "./_components/certificate-view";
import "../licence.css";

export const metadata: Metadata = { title: "Licence certificate" };

export default function CertificatePage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="p-cert wrap page">
      <Suspense fallback={<Loading label="Preparing certificate" />}>
        <CertificateView params={params} />
      </Suspense>
    </div>
  );
}
