import { resetDb } from "@/lib/mock/db";
import { fail, json } from "@/lib/mock/http";

// POST /api/dev/reset  Restores the seeded demo data. Mock only.
export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.AMI_ALLOW_RESET !== "1") {
    return fail(403, "Reset is switched off.");
  }
  resetDb();
  return json({ ok: true });
}
