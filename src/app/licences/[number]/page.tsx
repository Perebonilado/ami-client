import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { LicenceView } from "./_components/licence-view";
import "./licence.css";

export const metadata: Metadata = { title: "Your licence" };

export default function LicencePage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="p-licence wrap page">
      <Suspense fallback={<Loading label="Loading licence" />}>
        <LicenceView params={params} />
      </Suspense>
    </div>
  );
}
