"use client";

import { Field } from "@base-ui/react/field";
import { inputClass } from "@/components/ui/field";
import { UnverifiedTag } from "@/components/ui/badge";
import { PLATFORMS } from "@/lib/pricing";
import type { Platform, SocialAccount } from "@/lib/types";

export type Handles = Record<Platform, string>;

export const emptyHandles = (): Handles => ({ instagram: "", tiktok: "", youtube: "", x: "" });

export function handlesFromAccounts(accounts: SocialAccount[]): Handles {
  const h = emptyHandles();
  for (const a of accounts) if (!h[a.platform]) h[a.platform] = a.handle;
  return h;
}

export function handlesToInput(h: Handles) {
  return PLATFORMS.map((p) => ({ platform: p.value, handle: h[p.value].trim().replace(/^@+/, "") })).filter((x) => x.handle);
}

const placeholders: Record<Platform, string> = {
  instagram: "yourpage",
  tiktok: "yourpage",
  youtube: "YourChannel",
  x: "YourHandle",
};

/** Inputs for Instagram, TikTok, YouTube and X handles, each with an "@" prefix. */
export function HandleFields({ value, onChange, showUnverified = false }: { value: Handles; onChange: (h: Handles) => void; showUnverified?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PLATFORMS.map((p) => (
        <Field.Root key={p.value} className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Field.Label className="text-sm font-semibold text-ink">{p.label}</Field.Label>
            {showUnverified && value[p.value].trim() && <UnverifiedTag />}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-muted">@</span>
            <Field.Control
              value={value[p.value]}
              onChange={(e) => onChange({ ...value, [p.value]: e.target.value.replace(/^@+/, "") })}
              placeholder={placeholders[p.value]}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={`${inputClass} pl-8`}
            />
          </div>
        </Field.Root>
      ))}
    </div>
  );
}
