import type { NextRequest } from "next/server";
import { db, hashPassword, toUser } from "@/lib/mock/db";
import { body, fail, json, startSession } from "@/lib/mock/http";
import type { LoginInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const input = await body<LoginInput>(req);
  const email = input.email?.trim().toLowerCase();
  const user = db().users.find((u) => u.email === email);
  if (!user || user.passwordHash !== hashPassword(input.password ?? "")) {
    return fail(401, "That email and password don't match an account.");
  }
  if (user.suspended) return fail(403, "This account is suspended. Contact the Àmì team.");
  return startSession(json({ user: toUser(user) }), user.id);
}
