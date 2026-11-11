import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { PayView } from "./_components/pay-view";
import "./pay.css";

export const metadata: Metadata = { title: "Payment" };

export default function PayPage({ params }: { params: Promise<{ reference: string }> }) {
  return (
    <div className="p-pay wrap">
      <Suspense fallback={<Loading label="Loading payment" />}>
        <PayView params={params} />
      </Suspense>
    </div>
  );
}
