import { BadgeCheck, QrCode, TrendingUp } from "lucide-react";
import { AmiMark } from "@/components/logo";

/** The phone in the hero: a creator's Àmì app the moment a licence sells. Pure markup, no data. */
export function HeroPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] lg:mx-0 lg:ml-auto">
      {/* Floating proof chip */}
      <div className="absolute top-6 -left-14 z-20 hidden rotate-[-4deg] items-center gap-2.5 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-float sm:flex">
        <span className="flex size-8 items-center justify-center rounded-full bg-ok-wash text-ok">
          <BadgeCheck size={18} />
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-bold text-ink">Licence valid</span>
          <span className="code text-[11px] text-muted">AMI-7K3Q-92XD</span>
        </span>
      </div>

      {/* Floating QR chip */}
      <div className="absolute -right-4 bottom-28 z-20 hidden rotate-[5deg] items-center gap-2 rounded-2xl bg-ink px-3.5 py-2.5 text-white shadow-float sm:flex">
        <QrCode size={18} className="text-gold" />
        <span className="text-[13px] font-semibold">Scan to check</span>
      </div>

      <div className="relative z-10 mx-auto w-[290px] rotate-[2deg] rounded-[46px] bg-ink p-[10px] shadow-phone">
        <div className="relative overflow-hidden rounded-[37px] bg-canvas">
          <div className="absolute top-2.5 left-1/2 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-ink" aria-hidden />
          <div className="flex flex-col gap-3 px-4 pt-12 pb-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
                <AmiMark size={18} /> Àmì
              </span>
              <span className="flex size-7 items-center justify-center rounded-full bg-ember text-[10px] font-bold text-white">TA</span>
            </div>

            <div className="rounded-2xl border border-line bg-white p-3.5">
              <p className="text-[11px] font-semibold text-muted">Earnings this month</p>
              <p className="mt-0.5 text-[26px] leading-none font-extrabold tracking-tight tabular">₦212,500</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ok">
                <TrendingUp size={12} /> 4 licences sold this week
              </p>
              <svg viewBox="0 0 220 56" className="mt-2 h-14 w-full" aria-hidden>
                <defs>
                  <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="var(--color-ember)" stopOpacity="0.25" />
                    <stop offset="1" stopColor="var(--color-ember)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 48 L28 44 L56 46 L84 36 L112 38 L140 26 L168 28 L196 14 L220 8 L220 56 L0 56 Z" fill="url(#spark)" />
                <path d="M0 48 L28 44 L56 46 L84 36 L112 38 L140 26 L168 28 L196 14 L220 8" fill="none" stroke="var(--color-ember)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="220" cy="8" r="3.5" fill="var(--color-ember)" />
              </svg>
            </div>

            <div className="rounded-2xl border border-line bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted">New licence sold</p>
                <span className="rounded-full bg-ok-wash px-2 py-0.5 text-[10px] font-bold text-ok">+₦42,500</span>
              </div>
              <div className="mt-2 flex gap-2.5">
                <div className="h-14 w-11 shrink-0 rounded-lg bg-[linear-gradient(150deg,#1A141F,#5B3A6E)]" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[12px] leading-tight font-bold">My mum when I say I&apos;m not hungry</p>
                  <p className="mt-1 text-[11px] text-muted">Zobo &amp; Co. · Social · Instagram · 30 days</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-line bg-white p-3">
                <p className="text-[11px] font-semibold text-muted">Videos live</p>
                <p className="text-lg font-extrabold tabular">4</p>
              </div>
              <div className="rounded-2xl bg-ink p-3 text-white">
                <p className="text-[11px] font-semibold text-white/60">Pending payout</p>
                <p className="text-lg font-extrabold tabular">₦212.5k</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-10 -bottom-6 h-10 rounded-[50%] bg-ink/20 blur-2xl" aria-hidden />
    </div>
  );
}
