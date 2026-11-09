"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normaliseLicenceNumber } from "@/lib/pricing";

/** Licence number box used on dark backgrounds. */
export function CheckForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) router.push(`/check/${normaliseLicenceNumber(value)}`);
      }}
    >
      <label htmlFor="landing-check" className="sr-only">
        Licence number
      </label>
      <input
        id="landing-check"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="AMI-7K3Q-92XD"
        autoComplete="off"
        className="code h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/8 px-5 text-[15px] text-white uppercase placeholder:text-white/35 focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-white px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Check licence
      </button>
    </form>
  );
}
