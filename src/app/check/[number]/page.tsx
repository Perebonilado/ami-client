import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { CheckView } from "../_components/check-view";
import "../check.css";

export const metadata: Metadata = { title: "Check a licence" };

export default function CheckResultPage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="p-check wrap">
      <Suspense fallback={<Loading label="Checking licence" />}>
        <CheckView params={params} />
      </Suspense>
    </div>
  );
}
