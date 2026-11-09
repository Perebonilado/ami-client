import { QrCode } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/page";
import { CheckForm } from "./_components/check-form";

export const metadata: Metadata = { title: "Check a licence" };

export default function CheckPage() {
  return (
    <Container className="flex flex-1 flex-col items-center py-12 sm:py-20">
      <div className="flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">Licence check</span>
          <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">Is this post licensed?</h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Enter the licence number from an Àmì certificate to see who licensed the video, for which accounts, and until when. No account needed.
          </p>
        </div>
        <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <CheckForm autoFocus />
          <div className="flex items-start gap-3 rounded-2xl bg-sunken p-4 text-[14px] leading-relaxed text-muted">
            <QrCode size={20} className="mt-0.5 shrink-0 text-ink" aria-hidden />
            <p>Every Àmì certificate has a QR code that opens this page. Scan it with your phone camera to check a licence in one step.</p>
          </div>
        </section>
      </div>
    </Container>
  );
}
