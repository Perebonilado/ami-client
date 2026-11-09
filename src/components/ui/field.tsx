"use client";

import { Field } from "@base-ui/react/field";
import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/8 data-invalid:border-bad disabled:bg-sunken";

interface TextFieldProps extends Omit<ComponentProps<"input">, "className" | "prefix"> {
  label: string;
  description?: ReactNode;
  error?: string | null;
  className?: string;
  prefix?: ReactNode;
}

export function TextField({ label, description, error, className = "", prefix, ...props }: TextFieldProps) {
  return (
    <Field.Root invalid={!!error} className={`flex flex-col gap-1.5 ${className}`}>
      <Field.Label className="text-sm font-semibold text-ink">{label}</Field.Label>
      {prefix ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-muted">{prefix}</span>
          <Field.Control {...props} className={`${inputClass} pl-8`} />
        </div>
      ) : (
        <Field.Control {...props} className={inputClass} />
      )}
      {description && !error && <Field.Description className="text-[13px] text-muted">{description}</Field.Description>}
      {error && <p className="text-[13px] font-medium text-bad">{error}</p>}
    </Field.Root>
  );
}

interface TextAreaProps extends Omit<ComponentProps<"textarea">, "className"> {
  label: string;
  description?: ReactNode;
  className?: string;
}

export function TextAreaField({ label, description, className = "", ...props }: TextAreaProps) {
  return (
    <Field.Root className={`flex flex-col gap-1.5 ${className}`}>
      <Field.Label className="text-sm font-semibold text-ink">{label}</Field.Label>
      <Field.Control render={<textarea {...props} />} className={`${inputClass} h-auto min-h-28 resize-y py-3 leading-relaxed`} />
      {description && <Field.Description className="text-[13px] text-muted">{description}</Field.Description>}
    </Field.Root>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border border-bad/20 bg-bad-wash px-4 py-3 text-sm font-medium text-bad">
      {children}
    </p>
  );
}
