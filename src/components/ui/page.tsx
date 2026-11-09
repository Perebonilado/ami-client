import type { ReactNode } from "react";

/** Standard page width and side gutters. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow && <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">{eyebrow}</span>}
        <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{title}</h1>
        {description && <p className="text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-surface ${className}`}>{children}</section>;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-white/60 px-6 py-14 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <p className="max-w-md text-[15px] text-muted">{children}</p>}
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-line bg-white p-5">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="truncate text-2xl font-extrabold tracking-tight tabular">{value}</span>
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden />
      {label}…
    </div>
  );
}
