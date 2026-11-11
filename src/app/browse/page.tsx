import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { BrowseView } from "./_components/browse-view";
import "./browse.css";

export const metadata: Metadata = { title: "Browse videos" };

export default function BrowsePage() {
  return (
    <div className="p-browse">
      <Suspense fallback={<Loading label="Loading videos" />}>
        <BrowseView />
      </Suspense>
    </div>
  );
}
