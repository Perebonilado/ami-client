import type { NextRequest } from "next/server";
import { db, toUser, toVideo } from "@/lib/mock/db";
import { fail, json, sessionUser } from "@/lib/mock/http";
import type { AdminOverview } from "@/lib/types";

// GET /api/admin  Counts and tables for the Àmì team. Admin accounts only.
export async function GET(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in first.");
  if (!user.isAdmin) return fail(403, "Only the Àmì team can open the admin dashboard.");
  const d = db();
  const paidPayments = d.payments.filter((p) => p.status === "paid");
  const paidLicences = d.licences.filter((l) => paidPayments.some((p) => p.licenceId === l.id));

  const overview: AdminOverview = {
    counts: {
      users: d.users.length,
      videos: d.videos.length,
      licencesSold: paidLicences.length,
      totalValueKobo: paidLicences.reduce((s, l) => s + l.priceKobo, 0),
      feesKobo: paidLicences.reduce((s, l) => s + l.platformFeeKobo, 0),
    },
    users: d.users
      .map((u) => ({
        ...toUser(u),
        videoCount: d.videos.filter((v) => v.creatorId === u.id).length,
        licenceCount: paidLicences.filter((l) => l.buyerId === u.id).length,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    videos: [...d.videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toVideo),
    transactions: [...d.payments]
      .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))
      .map((p) => {
        const l = d.licences.find((x) => x.id === p.licenceId)!;
        const v = d.videos.find((x) => x.id === l.videoId)!;
        return {
          reference: p.reference,
          licenceNumber: l.licenceNumber,
          videoTitle: v.title,
          buyerName: d.users.find((u) => u.id === l.buyerId)!.name,
          creatorName: d.users.find((u) => u.id === v.creatorId)!.name,
          amountKobo: p.amountKobo,
          platformFeeKobo: l.platformFeeKobo,
          status: p.status,
          paidAt: p.paidAt,
        };
      }),
  };
  return json(overview);
}
