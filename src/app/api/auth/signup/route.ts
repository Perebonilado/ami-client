import type { NextRequest } from "next/server";
import { db, hashPassword, newId, toUser } from "@/lib/mock/db";
import { body, cleanHandle, fail, json, startSession } from "@/lib/mock/http";
import type { SignupInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const input = await body<SignupInput>(req);
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";
  if (!name || !email || !password) return fail(400, "Enter your name, email and a password.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, "Enter a valid email address.");
  if (password.length < 8) return fail(400, "Use a password with at least 8 characters.");
  if (db().users.some((u) => u.email === email)) return fail(409, "An account with this email already exists. Log in instead.");

  const id = newId("u");
  db().users.push({
    id,
    name,
    email,
    passwordHash: hashPassword(password),
    businessName: input.businessName?.trim() || null,
    isAdmin: false,
    verified: false,
    suspended: false,
    createdAt: new Date().toISOString(),
  });
  for (const s of input.socialAccounts ?? []) {
    const handle = cleanHandle(s.handle);
    if (handle) db().social.push({ id: newId("s"), userId: id, platform: s.platform, handle, verified: false });
  }
  const user = db().users.find((u) => u.id === id)!;
  return startSession(json({ user: toUser(user) }, { status: 201 }), id);
}
