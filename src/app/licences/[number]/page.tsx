import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { LicenceView } from "./_components/licence-view";

export const metadata: Metadata = { title: "Your licence" };

export default function LicencePage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <Container className="py-10 sm:py-14">
      <Suspense fallback={<Spinner label="Loading licence" />}>
        <LicenceView params={params} />
      </Suspense>
    </Container>
  );
}
