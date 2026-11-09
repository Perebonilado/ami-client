import { endSession, json } from "@/lib/mock/http";

export async function POST() {
  return endSession(json({ ok: true }));
}
