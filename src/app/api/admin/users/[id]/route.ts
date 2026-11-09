import type { NextRequest } from "next/server";
import { db, toUser } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/:id  { suspended?, verified? }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const admin = sessionUser(req);
  if (!admin?.isAdmin) return fail(403, "Only the Àmì team can do this.");
  const user = db().users.find((u) => u.id === id);
  if (!user) return fail(404, "No such user.");
  const input = await body<{ suspended: boolean; verified: boolean }>(req);
  if (input.suspended !== undefined) {
    if (user.id === admin.id) return fail(400, "You can't suspend your own account.");
    user.suspended = input.suspended;
  }
  if (input.verified !== undefined) user.verified = input.verified;
  return json({ user: toUser(user) });
}
