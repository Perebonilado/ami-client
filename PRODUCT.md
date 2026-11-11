# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Creators patronise other creators. Every Àmì user is a creator first: the same account uploads their own videos (skits, food, dance, lifestyle) and licenses other creators' clips to reuse inside their own videos. Social pages and brands can also buy licences, but creator-to-creator reuse is the core relationship.

Nigeria-first: prices are in naira, payments run through Nigerian bank rails, and the seeded catalogue is Nigerian skits and short-form video.

## Product Purpose

Àmì lets creators get paid when someone reuses their video, and lets other creators reuse clips legally. A buyer finds a clip, picks a licence, pays, and downloads the clean file plus a certificate. The original creator earns 85% of every sale.

Success: a visitor understands within seconds that the videos here can be licensed, finds one, and buys a licence; a creator sees what they have earned and from whom.

## Positioning

A licence anyone can check. Every licence carries a number (`AMI-XXXX-XXXX`) and a QR certificate that opens a public check page, and every upload is fingerprinted and timestamped. Creators set their own price; the licence states which part of the video it covers and how long it lasts.

## Operating Context

- Built for Access Youth Tech Forge 2026 (team04), demoed to judges at `https://team04.xtradot.co`.
- Front end: Next.js (this repo). Back end: NestJS (separate, in progress). Today the front end runs on mock API routes.
- Payments: Xtradot Bank sandbox (Access) hosted checkout; creator payouts by bank transfer.
- Demo content is dummy videos and placeholder images.

## Capabilities and Constraints

- Licence model (changed 10 Nov 2026, replaces Repost/Social/Advert, platforms and covered accounts): a buyer licenses either the whole video or a part of it (a time range they pick), for 1 month, 3 months, 1 year or forever. That's the whole decision.
- Prices must stay affordable (roughly ₦1,000 to ₦20,000). Proposed in the mockup, to confirm: the creator sets one price for the whole video for 1 month (e.g. ₦5,000); a part costs its share of the video's length, never less than a quarter; 3 months ×2, 1 year ×3, forever ×4; rounded up to the nearest ₦500, minimum ₦1,000. Àmì keeps 15%.
- Watermarked previews before purchase; clean file and certificate after.
- One account both uploads and licenses. Admin moderates users and videos.
- Terminology: "licence" (British spelling), "clip", "creator". Money is stored in kobo.

## Brand Commitments

- The name is Àmì, with its accents.
- The current logo mark and orange colour are not binding and may be replaced.
- The user wants a white background and a spacious feel, and information passed simply without overwhelming the reader. Named inspirations: Patreon, Selar, Netflix.

## Evidence on Hand

- Dummy videos: `public/samples/sample-1.mp4`, `sample-2.mp4`, `sample-3.mp4`.
- Synthetic demo creators, videos, licences and payments in `src/lib/mock/db.ts`.
- No real testimonials, customer counts, earnings figures or traction exist. Do not invent them.

## Product Principles

1. Show the videos first; explain second.
2. One idea at a time, in plain words. If a section needs a paragraph to make sense, it is doing too much.
3. Trust is visible: every licence can be checked by anyone.
4. Make the creator's money legible: who paid, for what, and how much reached them.
