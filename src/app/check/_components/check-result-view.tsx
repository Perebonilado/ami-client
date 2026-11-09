"use client";

import { use } from "react";
import { Container, Spinner } from "@/components/ui/page";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { normaliseLicenceNumber } from "@/lib/pricing";
import { CheckForm } from "./check-form";
import { CheckResult } from "./check-result";

export function CheckResultView({ params }: { params: Promise<{ number: string }> }) {
  const { number: raw } = use(params);
  const number = normaliseLicenceNumber(decodeURIComponent(raw));
  const { data, error, loading, reload } = useApi(() => api.checkLicence(number), [number]);

  return (
    <Container className="flex flex-1 flex-col items-center py-6 sm:py-14">
      <div className="flex w-full max-w-xl flex-col gap-5">
        {loading && !data ? (
          <Spinner label="Checking licence" />
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-surface p-6">
            <h1 className="text-xl font-extrabold">We couldn&apos;t check this licence right now</h1>
            <p className="text-[15px] text-muted">{error.message}</p>
            <button type="button" onClick={() => reload()} className="text-sm font-semibold underline underline-offset-4">
              Try again
            </button>
          </div>
        ) : data ? (
          <CheckResult number={number} result={data} />
        ) : null}

        <section className="no-print flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <CheckForm label="Check another licence" size="md" />
        </section>
      </div>
    </Container>
  );
}
