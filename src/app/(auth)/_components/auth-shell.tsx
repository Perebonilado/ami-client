import type { ReactNode } from "react";

/** Centered white card used by the sign-up and log-in screens. */
export function AuthShell({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
      <div className="flex w-full max-w-md flex-col gap-4">
        <section className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6 shadow-float sm:p-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl leading-tight font-extrabold sm:text-[28px]">{title}</h1>
            {description && <p className="text-[15px] leading-relaxed text-muted">{description}</p>}
          </div>
          {children}
        </section>
        {footer}
      </div>
    </div>
  );
}

/** Only allow redirects to paths on this site. */
export function safeNext(next: string | null, fallback = "/browse") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
