import { connection, type NextRequest } from "next/server";
import { db, toLicence, toVideo } from "@/lib/mock/db";
import { fail, json, sessionUser } from "@/lib/mock/http";
import type { PaymentSession } from "@/lib/types";

type Ctx = { params: Promise<{ reference: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  await connection();
  const { reference } = await params;
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to see this payment.");
  const payment = db().payments.find((p) => p.reference === reference);
  const licence = payment && db().licences.find((l) => l.id === payment.licenceId);
  if (!payment || !licence || licence.buyerId !== user.id) return fail(404, "We couldn't find this payment.");
  const video = db().videos.find((v) => v.id === licence.videoId)!;
  const session: PaymentSession = {
    reference,
    amountKobo: payment.amountKobo,
    paymentUrl: `/pay/${reference}`,
    status: payment.status,
    licence: toLicence(licence),
    video: toVideo(video),
  };
  return json(session);
}
