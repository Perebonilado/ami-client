import { ArrowRight, BadgeCheck, Download, FileCheck2, Search, Tag, Upload, Wallet } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/page";
import { formatNaira } from "@/lib/format";
import { DURATIONS, USE_TYPES } from "@/lib/pricing";
import { CheckForm } from "./_components/check-form";
import { HeroPhone } from "./_components/hero-phone";
import { LatestVideos } from "./_components/latest-videos";

const creatorSteps = [
  { icon: Upload, title: "Upload your skit", body: "Àmì fingerprints the file and timestamps it, so there's a record of what you made and when." },
  { icon: Tag, title: "Set three prices", body: "One base price each for Repost, Social and Advert. Duration and platform adjust it for you." },
  { icon: Wallet, title: "Get paid in naira", body: "Every licence shows up in your library with who bought it, where they can post it and until when." },
];

const buyerSteps = [
  { icon: Search, title: "Find a clip", body: "Search by title, creator or tag, and watch the watermarked preview." },
  { icon: FileCheck2, title: "Pick your licence", body: "Choose the use, the platform and the account it covers. The price updates as you choose." },
  { icon: Download, title: "Download and post", body: "Pay by transfer or card, then download the clean file and a certificate with a QR code." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <Container className="grid items-center gap-14 pt-12 pb-20 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pt-20 lg:pb-24">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-muted">
              <span className="size-1.5 rounded-full bg-ember" aria-hidden />
              For Nigerian video creators, pages and brands
            </span>
            <h1 className="max-w-xl text-[44px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
              Turn stolen clips into paid licences.
            </h1>
            <p className="max-w-md text-[17px] leading-relaxed text-muted">
              Creators list their videos. Pages and brands pay in naira for a licence, a clean file and a certificate anyone can check.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href="/signup" size="lg">
                Sign up free
              </LinkButton>
              <LinkButton href="/browse" variant="secondary" size="lg">
                Browse videos
              </LinkButton>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <BadgeCheck size={16} className="text-ember" />
              One account to upload and to license. Pay by transfer or card.
            </p>

            <dl className="mt-6 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
              <div className="flex flex-col gap-1">
                <dt className="order-2 text-[13px] leading-snug text-muted">of every sale goes to the creator</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight tabular sm:text-[34px]">85%</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="order-2 text-[13px] leading-snug text-muted">licences start from, for 30 days</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight tabular sm:text-[34px]">₦10k</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="order-2 text-[13px] leading-snug text-muted">scan to prove a licence is real</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight tabular sm:text-[34px]">1</dd>
              </div>
            </dl>
          </div>

          <HeroPhone />
        </Container>
      </section>

      {/* Latest videos */}
      <section className="border-t border-line bg-white/50 py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">Fresh on Àmì</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Skits ready to license</h2>
            </div>
            <Link href="/browse" className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
              Browse all <ArrowRight size={16} />
            </Link>
          </div>
          <LatestVideos />
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-20">
        <Container className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">How it works</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Every repost can be a paid, legal licence.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { title: "If you make videos", steps: creatorSteps, cta: { href: "/upload", label: "Upload a video" } },
              { title: "If you run a page or brand", steps: buyerSteps, cta: { href: "/browse", label: "Find a clip" } },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h3 className="text-xl font-bold">{col.title}</h3>
                <ol className="flex flex-col gap-5">
                  {col.steps.map((s, i) => (
                    <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                      <span className="flex size-10 items-center justify-center rounded-full bg-sunken text-ink ring-1 ring-line">
                        <s.icon size={18} />
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="font-bold">
                          <span className="mr-2 text-faint tabular">{i + 1}.</span>
                          {s.title}
                        </p>
                        <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link href={col.cta.href} className="mt-auto flex w-fit items-center gap-1.5 text-sm font-semibold hover:underline">
                  {col.cta.label} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-line bg-white/50 py-20">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-xl flex-col gap-3">
              <span className="text-xs font-bold tracking-[0.12em] text-ember-ink uppercase">Licences and pricing</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Three licence types. Creators set the price.</h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">
              Prices below are the suggested base for 30 days on one platform. Àmì keeps 15% of each sale.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {USE_TYPES.map((u) => (
              <div key={u.value} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{u.label}</h3>
                  <span className="text-[13px] text-muted">{u.forWho}</span>
                </div>
                <p className="text-[34px] leading-none font-semibold tracking-tight tabular">
                  {formatNaira(u.suggestedKobo)}
                  <span className="ml-1 text-sm font-medium tracking-normal text-muted">from</span>
                </p>
                <p className="text-[15px] leading-relaxed text-muted">{u.allows}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] font-semibold">Longer or wider licences cost more:</p>
            <ul className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <li key={d.value} className="rounded-full bg-sunken px-3 py-1.5 text-[13px] font-semibold ring-1 ring-line">
                  {d.label} <span className="text-muted tabular">×{d.multiplier}</span>
                </li>
              ))}
              <li className="rounded-full bg-sunken px-3 py-1.5 text-[13px] font-semibold ring-1 ring-line">
                All platforms <span className="text-muted tabular">×2</span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Check */}
      <section className="py-20">
        <Container>
          <div className="relative flex flex-col gap-8 overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-md flex-col gap-3">
              <h2 className="text-3xl font-semibold sm:text-4xl">Got a certificate? Check it.</h2>
              <p className="text-[15px] leading-relaxed text-white/65">
                Scan the QR code on any Àmì certificate, or type the licence number. You&apos;ll see the video, who licensed it, where they can post it and until when.
              </p>
            </div>
            <CheckForm />
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-ember/25 blur-3xl" aria-hidden />
          </div>
        </Container>
      </section>
    </>
  );
}
