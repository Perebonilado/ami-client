"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { normaliseLicenceNumber } from "@/lib/pricing";

/** Licence number input. Normalises "ami7k3q92xd" to "AMI-7K3Q-92XD" and opens the result page. */
export function CheckForm({ label = "Licence number", size = "lg", autoFocus = false }: { label?: string; size?: "md" | "lg"; autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  const big = size === "lg";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = normaliseLicenceNumber(value);
    if (!n) return;
    router.push(`/check/${encodeURIComponent(n)}`);
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="AMI-7K3Q-92XD"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          autoFocus={autoFocus}
          className={`code w-full min-w-0 rounded-2xl border border-line bg-white px-4 font-semibold tracking-[0.08em] text-ink placeholder:font-normal placeholder:text-faint hover:border-line-strong focus:border-ink focus:ring-4 focus:ring-ink/8 focus:outline-none ${big ? "h-14 text-lg" : "h-12 text-base"}`}
        />
        <Button type="submit" size={big ? "lg" : "md"} disabled={!value.trim()} className={big ? "h-14 sm:px-8" : "h-12"}>
          <Search size={18} /> Check
        </Button>
      </div>
    </form>
  );
}
