import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { LoginForm } from "./login-form";
import "../auth.css";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
