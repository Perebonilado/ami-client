import type { NextRequest } from "next/server";
import { db, newId, toUser } from "@/lib/mock/db";
import { body, cleanHandle, fail, json, sessionUser } from "@/lib/mock/http";
import type { UpdateProfileInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = sessionUser(req);
  return json({ user: user ? toUser(user) : null });
}

export async function PATCH(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to edit your profile.");
  const input = await body<UpdateProfileInput>(req);

  if (input.name !== undefined) {
    if (!input.name.trim()) return fail(400, "Your name can't be empty.");
    user.name = input.name.trim();
  }
  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, "Enter a valid email address.");
    if (db().users.some((u) => u.email === email && u.id !== user.id)) return fail(409, "Another account already uses this email.");
    user.email = email;
  }
  if (input.businessName !== undefined) user.businessName = input.businessName?.trim() || null;
  if (input.socialAccounts) {
    const d = db();
    d.social = d.social.filter((s) => s.userId !== user.id);
    for (const s of input.socialAccounts) {
      const handle = cleanHandle(s.handle);
      if (handle) d.social.push({ id: newId("s"), userId: user.id, platform: s.platform, handle, verified: false });
    }
  }
  return json({ user: toUser(user) });
}
