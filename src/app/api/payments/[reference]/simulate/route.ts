import type { NextRequest } from "next/server";
import { db, toLicence } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import { endDate } from "@/lib/pricing";

type Ctx = { params: Promise<{ reference: string }> };

// POST /api/payments/:reference/simulate  { outcome: "paid" | "failed" }
// Stands in for the Access Bank sandbox webhook. Keep it as the hidden
// "simulate payment" switch for demo day in case the sandbox fails on stage.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { reference } = await params;
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to pay.");
  const { outcome } = await body<{ outcome: "paid" | "failed" }>(req);
  const payment = db().payments.find((p) => p.reference === reference);
  const licence = payment && db().licences.find((l) => l.id === payment.licenceId);
  if (!payment || !licence || licence.buyerId !== user.id) return fail(404, "We couldn't find this payment.");
  if (payment.status === "paid") return json({ status: payment.status, licence: toLicence(licence) });

  if (outcome === "failed") {
    payment.status = "failed";
    return json({ status: payment.status, licence: toLicence(licence) });
  }

  const now = new Date();
  payment.status = "paid";
  payment.paidAt = now.toISOString();
  licence.status = "active";
  licence.startsAt = now.toISOString();
  licence.endsAt = endDate(now, licence.duration)?.toISOString() ?? null;
  return json({ status: payment.status, licence: toLicence(licence) });
}
