import type { NextRequest } from "next/server";
import { db, effectiveStatus, toLicence, toVideo } from "@/lib/mock/db";
import { fail, json, sessionUser } from "@/lib/mock/http";
import type { Library, Sale } from "@/lib/types";

// GET /api/library  The logged-in user's videos, sales, earnings and bought licences.
export async function GET(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to see your library.");
  const d = db();
  const mine = d.videos.filter((v) => v.creatorId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const paid = d.licences.filter((l) => l.status !== "pending");

  const videos = mine.map((v) => {
    const sold = paid.filter((l) => l.videoId === v.id);
    return { ...toVideo(v), licencesSold: sold.length, earningsKobo: sold.reduce((s, l) => s + l.creatorShareKobo, 0) };
  });

  const sales: Sale[] = paid
    .filter((l) => mine.some((v) => v.id === l.videoId))
    .sort((a, b) => (b.startsAt ?? "").localeCompare(a.startsAt ?? ""))
    .map((l) => {
      const v = mine.find((x) => x.id === l.videoId)!;
      const buyer = d.users.find((u) => u.id === l.buyerId)!;
      return {
        licenceNumber: l.licenceNumber,
        videoId: v.id,
        videoTitle: v.title,
        videoThumbnailUrl: v.thumbnailUrl,
        videoPoster: v.poster,
        buyerName: buyer.name,
        buyerBusinessName: buyer.businessName,
        part: l.part,
        duration: l.duration,
        startsAt: l.startsAt,
        endsAt: l.endsAt,
        creatorShareKobo: l.creatorShareKobo,
        status: effectiveStatus(l),
      };
    });

  const earningsKobo = videos.reduce((s, v) => s + v.earningsKobo, 0);
  const licences = paid
    .filter((l) => l.buyerId === user.id)
    .sort((a, b) => (b.startsAt ?? "").localeCompare(a.startsAt ?? ""))
    .map(toLicence);

  const library: Library = {
    totals: { videos: videos.length, licencesSold: sales.length, earningsKobo, pendingPayoutKobo: earningsKobo },
    videos,
    sales,
    licences,
  };
  return json(library);
}
