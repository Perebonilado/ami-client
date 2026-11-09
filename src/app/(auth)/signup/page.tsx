import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/page";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SignupForm />
    </Suspense>
  );
}
