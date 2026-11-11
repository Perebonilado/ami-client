import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { LibraryView } from "./_components/library-view";
import "./library.css";

export const metadata: Metadata = { title: "My library" };

export default function LibraryPage() {
  return (
    <div className="p-library wrap page">
      <Suspense fallback={<Loading label="Loading your library" />}>
        <LibraryView />
      </Suspense>
    </div>
  );
}
