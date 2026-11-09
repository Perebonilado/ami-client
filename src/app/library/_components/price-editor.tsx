"use client";

import { Switch } from "@/components/ui/controls";
import { inputClass } from "@/components/ui/field";
import { formatNaira } from "@/lib/format";
import { USE_TYPES, licencePriceKobo } from "@/lib/pricing";
import type { UseType, VideoPrice } from "@/lib/types";

/**
 * One row per licence type: a switch to offer it and a base price in naira
 * (30 days, one platform). Prices are stored in kobo.
 */
export function PriceEditor({ prices, onChange }: { prices: VideoPrice[]; onChange: (prices: VideoPrice[]) => void }) {
  const current = (useType: UseType) =>
    prices.find((p) => p.useType === useType) ?? {
      useType,
      basePriceKobo: USE_TYPES.find((u) => u.value === useType)!.suggestedKobo,
      enabled: false,
    };

  const update = (useType: UseType, patch: Partial<VideoPrice>) => {
    const next = USE_TYPES.map((u) => {
      const p = current(u.value);
      return u.value === useType ? { ...p, ...patch } : p;
    });
    onChange(next);
  };

  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {USE_TYPES.map((u) => {
        const price = current(u.value);
        const id = `price-${u.value}`;
        const naira = price.basePriceKobo ? Math.round(price.basePriceKobo / 100).toLocaleString("en-NG") : "";
        return (
          <div
            key={u.value}
            className={`flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:gap-6 sm:p-5 ${price.enabled ? "" : "bg-sunken/70"}`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
              <div className="pt-0.5">
                <Switch checked={price.enabled} onChange={(c) => update(u.value, { enabled: c })} label={`Offer ${u.label} licences`} />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[15px] font-bold text-ink">
                  {u.label} <span className="font-medium text-muted">· {u.forWho}</span>
                </p>
                <p className="text-[13px] leading-snug text-muted">{u.allows}</p>
                {price.enabled && price.basePriceKobo > 0 ? (
                  <p className="mt-1 text-[12px] text-muted tabular">
                    30 days, one platform: <span className="font-semibold text-ink">{formatNaira(licencePriceKobo(price.basePriceKobo, "30d", "instagram"))}</span>
                    {" · "}1 year, all platforms:{" "}
                    <span className="font-semibold text-ink">{formatNaira(licencePriceKobo(price.basePriceKobo, "1y", "all"))}</span>
                  </p>
                ) : !price.enabled ? (
                  <p className="mt-1 text-[12px] font-medium text-faint">Not offered for this video</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:w-44">
              <label htmlFor={id} className="sr-only">
                {u.label} base price in naira
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-muted">₦</span>
                <input
                  id={id}
                  inputMode="numeric"
                  autoComplete="off"
                  value={naira}
                  disabled={!price.enabled}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                    update(u.value, { basePriceKobo: digits ? parseInt(digits, 10) * 100 : 0 });
                  }}
                  className={`${inputClass} pl-8 text-right font-semibold tabular`}
                />
              </div>
              <span className="text-right text-[11px] text-faint">base · 30 days, one platform</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
