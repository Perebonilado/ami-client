"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronsUpDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  hideLabel?: boolean;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function Select({ label, hideLabel, options, value, onChange, placeholder = "Choose…", className = "", triggerClassName = "" }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <BaseSelect.Root
        items={options}
        value={value}
        onValueChange={(v) => {
          if (v != null) onChange(v as string);
        }}
      >
        {label && <BaseSelect.Label className={hideLabel ? "sr-only" : "text-sm font-semibold text-ink"}>{label}</BaseSelect.Label>}
        <BaseSelect.Trigger
          className={`flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-white px-3.5 text-left text-[15px] text-ink transition-colors select-none hover:border-line-strong focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/8 data-popup-open:border-ink ${triggerClassName}`}
        >
          <BaseSelect.Value className="truncate data-placeholder:text-faint" placeholder={placeholder} />
          <BaseSelect.Icon className="shrink-0 text-muted">
            <ChevronsUpDown size={16} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className="z-50 outline-none select-none" sideOffset={6} alignItemWithTrigger={false}>
            <BaseSelect.Popup className="min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-2xl border border-line bg-white p-1.5 text-ink shadow-float outline-none transition-[scale,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <BaseSelect.List className="max-h-(--available-height) overflow-y-auto">
                {options.map((o) => (
                  <BaseSelect.Item
                    key={o.value}
                    value={o.value}
                    className="grid cursor-default grid-cols-[1fr_1rem] items-center gap-3 rounded-xl py-2.5 pr-3 pl-3 text-[15px] outline-none select-none data-highlighted:bg-sunken data-selected:font-semibold"
                  >
                    <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="text-ember">
                      <Check size={16} />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}
