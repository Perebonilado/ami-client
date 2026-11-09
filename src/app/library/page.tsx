import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/page";
import { LibraryView } from "./_components/library-view";

export const metadata: Metadata = { title: "My library" };

export default function LibraryPage() {
  return (
    <Suspense fallback={<Spinner label="Loading your library" />}>
      <LibraryView />
    </Suspense>
  );
}
