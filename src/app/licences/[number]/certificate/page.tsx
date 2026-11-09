import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/page";
import { CertificateView } from "./_components/certificate-view";

export const metadata: Metadata = { title: "Licence certificate" };

export default function CertificatePage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="flex justify-center px-4 py-10 print:p-0">
      <Suspense fallback={<Spinner label="Preparing certificate" />}>
        <CertificateView params={params} />
      </Suspense>
    </div>
  );
}
