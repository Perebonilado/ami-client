import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { SignupForm } from "./signup-form";
import "../auth.css";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupForm />
    </Suspense>
  );
}
