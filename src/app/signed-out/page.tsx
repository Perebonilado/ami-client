import type { Metadata } from "next";
import { Suspense } from "react";
import { SignedOutView } from "./signed-out-view";

export const metadata: Metadata = { title: "You’re logged out" };

export default function SignedOutPage() {
  return (
    <div className="wrap">
      <Suspense fallback={null}>
        <SignedOutView />
      </Suspense>
    </div>
  );
}
