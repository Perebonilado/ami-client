import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { BrowseView } from "./_components/browse-view";

export const metadata: Metadata = { title: "Browse videos" };

export default function BrowsePage() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex max-w-2xl flex-col gap-2">
        <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">Browse</span>
        <h1 className="text-3xl leading-tight font-semibold sm:text-[44px]">Find a clip to license</h1>
        <p className="text-[15px] leading-relaxed text-muted">Every video here is listed by the person who made it. License it, post it, and keep the certificate.</p>
      </div>
      <Suspense fallback={<Spinner label="Loading videos" />}>
        <BrowseView />
      </Suspense>
    </Container>
  );
}
