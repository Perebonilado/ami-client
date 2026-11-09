// Helpers for the mock API route handlers.
import { NextResponse, type NextRequest } from "next/server";
import { db, type UserRow } from "./db";

export const SESSION_COOKIE = "ami_session";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function sessionUser(req: NextRequest): UserRow | null {
  const id = req.cookies.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const user = db().users.find((u) => u.id === id);
  if (!user || user.suspended) return null;
  return user;
}

export function startSession(res: NextResponse, userId: string) {
  res.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}

export function endSession(res: NextResponse) {
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export async function body<T>(req: NextRequest): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    return {};
  }
}

export function cleanHandle(h: string) {
  return h.trim().replace(/^@+/, "");
}
