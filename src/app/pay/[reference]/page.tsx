import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { PayView } from "./_components/pay-view";

export const metadata: Metadata = { title: "Pay" };

export default function PayPage({ params }: { params: Promise<{ reference: string }> }) {
  return (
    <Container className="flex justify-center py-10 sm:py-16">
      <Suspense fallback={<Spinner label="Loading payment" />}>
        <PayView params={params} />
      </Suspense>
    </Container>
  );
}
