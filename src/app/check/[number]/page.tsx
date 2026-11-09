import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { CheckResultView } from "../_components/check-result-view";

export const metadata: Metadata = { title: "Licence check" };

export default function CheckResultPage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <Suspense
      fallback={
        <Container className="py-14">
          <Spinner label="Checking licence" />
        </Container>
      }
    >
      <CheckResultView params={params} />
    </Suspense>
  );
}
