"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function Checkbox({
  checked,
  onChange,
  children,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-line-strong has-data-checked:border-ink">
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={(c) => onChange(c)}
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-line-strong bg-white text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-checked:border-ink data-checked:bg-ink"
      >
        <BaseCheckbox.Indicator className="flex data-unchecked:hidden">
          <Check size={14} strokeWidth={3} />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-ink">{children}</span>
        {description && <span className="text-[13px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={(c) => onChange(c)}
      aria-label={label}
      className="relative flex h-6 w-10 shrink-0 rounded-full bg-line-strong p-0.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-checked:bg-ink"
    >
      <BaseSwitch.Thumb className="size-5 rounded-full bg-white shadow-sm transition-transform duration-150 data-checked:translate-x-4" />
    </BaseSwitch.Root>
  );
}

export interface RadioCardOption<T extends string> {
  value: T;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}

/** A group of selectable cards built on Base UI RadioGroup. */
export function RadioCards<T extends string>({
  label,
  value,
  onChange,
  options,
  columns = 1,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: RadioCardOption<T>[];
  columns?: 1 | 2 | 3 | 4 | 5;
}) {
  const cols = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", 5: "grid-cols-2 sm:grid-cols-5" }[columns];
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as T)} aria-label={label} className={`grid gap-2 ${cols}`}>
      {options.map((o) => (
        <Radio.Root
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          nativeButton
          render={<button type="button" />}
          className="group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left transition-[border-color,box-shadow,background-color] hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-checked:border-ink data-checked:shadow-[inset_0_0_0_1px_var(--color-ink)] data-disabled:cursor-not-allowed data-disabled:opacity-45"
        >
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-ink">{o.title}</span>
            {o.description && <span className="text-[13px] leading-snug text-muted">{o.description}</span>}
          </span>
          {o.aside && <span className="shrink-0 text-sm font-semibold text-ink tabular">{o.aside}</span>}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <BaseProgress.Root value={value} className="grid w-full grid-cols-[1fr_auto] gap-y-2">
      <BaseProgress.Label className="text-sm font-semibold text-ink">{label}</BaseProgress.Label>
      <BaseProgress.Value className="text-right text-sm text-muted tabular" />
      <BaseProgress.Track className="col-span-2 h-2 overflow-hidden rounded-full bg-line">
        <BaseProgress.Indicator className="rounded-full bg-ember transition-[width] duration-300" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
