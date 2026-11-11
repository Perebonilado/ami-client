import BigNumber from "bignumber.js";
import type { Duration, LicencePart } from "./types";

// Licence pricing (proposed for the hackathon; see PRODUCT.md).
// The creator sets one price: the whole video for 1 month. A part of the video costs its share
// of the video's length, never less than a quarter. Longer licences multiply the price.
// Everything rounds up to the nearest ₦500, with a ₦1,000 minimum. Àmì keeps 15%.
// Money maths uses bignumber.js, the same as the server, so the price shown is the price charged.

export const PLATFORM_FEE_RATE = 0.15;
export const SUGGESTED_BASE_KOBO = 5_000_00;
export const MIN_BASE_KOBO = 1_000_00;
export const MIN_PART_SEC = 2;
const MIN_PART_SHARE = 0.25;
const MIN_PRICE_KOBO = 1_000_00;
const ROUND_KOBO = 500_00;

export const DURATIONS: { value: Duration; label: string; phrase: string; multiplier: number; days: number | null }[] = [
  { value: "1m", label: "1 month", phrase: "1 month", multiplier: 1, days: 30 },
  { value: "3m", label: "3 months", phrase: "3 months", multiplier: 2, days: 90 },
  { value: "1y", label: "1 year", phrase: "1 year", multiplier: 3, days: 365 },
  { value: "forever", label: "Forever", phrase: "forever", multiplier: 4, days: null },
];

export const CATEGORIES = ["Comedy", "Food", "Dance", "Owambe", "Lifestyle"] as const;

export function durationLabel(d: Duration) {
  return DURATIONS.find((x) => x.value === d)?.label ?? d;
}
export function durationPhrase(d: Duration) {
  return DURATIONS.find((x) => x.value === d)?.phrase ?? d;
}

/** Whole seconds in a part, or the whole video when `part` is null. */
export function partLength(part: LicencePart | null, videoSec: number) {
  return part ? Math.max(0, part.endSec - part.startSec) : videoSec;
}

/** Checks a requested part against the video. Returns a cleaned part, or an error sentence. */
export function cleanPart(part: LicencePart | null | undefined, videoSec: number): LicencePart | null | string {
  if (!part) return null;
  const startSec = Math.max(0, Math.floor(part.startSec));
  const endSec = Math.min(Math.ceil(videoSec), Math.ceil(part.endSec));
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec)) return "Choose which part of the video you need.";
  if (endSec - startSec < MIN_PART_SEC) return `A part has to be at least ${MIN_PART_SEC} seconds long.`;
  if (startSec === 0 && endSec >= Math.ceil(videoSec)) return null; // that's the whole video
  return { startSec, endSec };
}

/** Price of a licence in kobo. */
export function licencePriceKobo(baseKobo: number, videoSec: number, part: LicencePart | null, duration: Duration) {
  const share =
    part && videoSec > 0 ? BigNumber.max(MIN_PART_SHARE, new BigNumber(partLength(part, videoSec)).dividedBy(videoSec)) : new BigNumber(1);
  const multiplier = DURATIONS.find((x) => x.value === duration)?.multiplier ?? 1;
  const raw = new BigNumber(baseKobo).times(share).times(multiplier);
  const rounded = raw.dividedBy(ROUND_KOBO).integerValue(BigNumber.ROUND_CEIL).times(ROUND_KOBO);
  return BigNumber.max(MIN_PRICE_KOBO, rounded).toNumber();
}

/** Splits a price into Àmì's fee and the creator's share. Both whole kobo. */
export function splitPrice(priceKobo: number) {
  const fee = new BigNumber(priceKobo).times(PLATFORM_FEE_RATE).integerValue(BigNumber.ROUND_HALF_UP);
  return { platformFeeKobo: fee.toNumber(), creatorShareKobo: new BigNumber(priceKobo).minus(fee).toNumber() };
}

export function endDate(start: Date, duration: Duration): Date | null {
  const days = DURATIONS.find((x) => x.value === duration)?.days;
  if (days == null) return null;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

// Readable licence numbers: no 0/O or 1/I so people can type them.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function makeLicenceNumber(random: () => number = Math.random) {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join("");
  return `AMI-${block()}-${block()}`;
}

export function normaliseLicenceNumber(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("AMI") ? raw.slice(3) : raw;
  if (body.length !== 8) return input.trim().toUpperCase();
  return `AMI-${body.slice(0, 4)}-${body.slice(4)}`;
}

/** Tidies what people type into AMI-XXXX-XXXX as they type. */
export function tidyLicenceInput(input: string) {
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.startsWith("AMI")) s = s.slice(3);
  s = s.slice(0, 8);
  if (!s) return input.trim() ? "AMI-" : "";
  return `AMI-${s.slice(0, 4)}${s.length > 4 ? `-${s.slice(4)}` : ""}`;
}
