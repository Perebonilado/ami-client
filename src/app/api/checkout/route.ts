import type { NextRequest } from "next/server";
import { db, newId, uniqueLicenceNumber } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import { DURATIONS, LICENCE_PLATFORMS, licencePriceKobo, splitPrice } from "@/lib/pricing";
import type { CheckoutInput, CheckoutResult } from "@/lib/types";

// POST /api/checkout  Creates a pending licence and a payment, then returns where to pay.
// The licence only becomes active when the payment is confirmed (webhook or callback).
export async function POST(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to license this video.");
  const input = await body<CheckoutInput>(req);
  const d = db();

  const video = d.videos.find((v) => v.id === input.videoId);
  if (!video || video.status !== "live") return fail(404, "This video isn't available to license.");
  if (video.creatorId === user.id) return fail(403, "You can't license your own video.");
  if (!DURATIONS.some((x) => x.value === input.duration)) return fail(400, "Pick how long you need the licence.");
  if (!LICENCE_PLATFORMS.some((x) => x.value === input.platform)) return fail(400, "Pick a platform.");
  const price = d.prices.find((p) => p.videoId === video.id && p.useType === input.useType);
  if (!price || !price.enabled) return fail(400, "The creator doesn't offer this licence type for this video.");
  const accounts = (input.coveredAccounts ?? []).map((a) => a.trim()).filter(Boolean).map((a) => (a.startsWith("@") ? a : `@${a}`));
  if (!accounts.length) return fail(400, "Name the account this licence covers.");

  const priceKobo = licencePriceKobo(price.basePriceKobo, input.duration!, input.platform!);
  const { platformFeeKobo, creatorShareKobo } = splitPrice(priceKobo);
  const licenceId = newId("l");
  const licenceNumber = uniqueLicenceNumber();
  d.licences.push({
    id: licenceId,
    licenceNumber,
    videoId: video.id,
    buyerId: user.id,
    useType: input.useType!,
    platform: input.platform!,
    coveredAccounts: accounts,
    duration: input.duration!,
    startsAt: null,
    endsAt: null,
    priceKobo,
    platformFeeKobo,
    creatorShareKobo,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  const reference = `SBX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  d.payments.push({ id: newId("p"), licenceId, reference, amountKobo: priceKobo, status: "initiated", paidAt: null });

  const result: CheckoutResult = { licenceNumber, paymentReference: reference, amountKobo: priceKobo, paymentUrl: `/pay/${reference}` };
  return json(result, { status: 201 });
}
