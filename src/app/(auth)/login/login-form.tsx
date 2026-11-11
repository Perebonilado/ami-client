"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { errorMessage, useLoginMutation } from "@/store/api";
import { useAuth } from "@/store/auth";
import { AuthShell, PasswordInput, safeNext } from "../_components/auth-shell";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { user, ready } = useAuth();
  const [login] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already logged in: carry on to where they were going
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const withNext = (path: string) => (next !== "/browse" ? `${path}?next=${encodeURIComponent(next)}` : path);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const bad = { email: !email.trim(), password: !password };
    setErrors(bad);
    if (bad.email || bad.password) return document.getElementById(bad.email ? "email" : "password")?.focus();
    setBusy(true);
    setFormError(null);
    try {
      await login({ email: email.trim(), password }).unwrap();
    } catch (err) {
      setFormError(errorMessage(err, "We couldn’t log you in. Try again."));
      setBusy(false);
    }
  }

  return (
    <AuthShell swap={{ href: withNext("/signup"), label: "Sign up" }}>
      <h1>Welcome back</h1>
      <form className="form" noValidate onSubmit={submit}>
        <div className={`f${errors.email ? " has-err" : ""}`}>
          <label htmlFor="email">Email</label>
          <input
            className="input"
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: false }));
            }}
          />
          {errors.email && <p className="ferr">Enter your email address.</p>}
        </div>
        <div className={`f${errors.password ? " has-err" : ""}`}>
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setErrors((x) => ({ ...x, password: false }));
            }}
          />
          {errors.password && <p className="ferr">Enter your password.</p>}
        </div>
        {formError && (
          <p className="form-err" role="alert">
            {formError}
          </p>
        )}
        <button className="btn btn-ink" type="submit" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="alt">
        New to Àmì? <Link href={withNext("/signup")}>Create an account</Link>
      </p>
    </AuthShell>
  );
}
