"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { errorMessage, useSignupMutation } from "@/store/api";
import { useAuth } from "@/store/auth";
import { AuthShell, PasswordInput, safeNext } from "../_components/auth-shell";

type Field = "name" | "email" | "password";

export function SignupForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { user, ready } = useAuth();
  const [signup] = useSignupMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const withNext = (path: string) => (next !== "/browse" ? `${path}?next=${encodeURIComponent(next)}` : path);
  const clear = (f: Field) => setErrors((x) => ({ ...x, [f]: false }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const bad = { name: !name.trim(), email: !/^\S+@\S+\.\S+$/.test(email.trim()), password: password.length < 8 };
    setErrors(bad);
    const first = (Object.keys(bad) as Field[]).find((k) => bad[k]);
    if (first) return document.getElementById(first)?.focus();
    setBusy(true);
    setFormError(null);
    try {
      await signup({ name: name.trim(), email: email.trim(), password }).unwrap();
    } catch (err) {
      setFormError(errorMessage(err, "We couldn’t create your account. Try again."));
      setBusy(false);
    }
  }

  return (
    <AuthShell swap={{ href: withNext("/login"), label: "Log in" }}>
      <h1>Create your account</h1>
      <form className="form" noValidate onSubmit={submit}>
        <div className={`f${errors.name ? " has-err" : ""}`}>
          <label htmlFor="name">Full name</label>
          <input
            className="input"
            id="name"
            type="text"
            placeholder="Tolu Adeyemi"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
          />
          {errors.name && <p className="ferr">Enter your name.</p>}
        </div>
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
              clear("email");
            }}
          />
          {errors.email && <p className="ferr">Enter a valid email address.</p>}
        </div>
        <div className={`f${errors.password ? " has-err" : ""}`}>
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(v) => {
              setPassword(v);
              clear("password");
            }}
          />
          {errors.password && <p className="ferr">Use at least 8 characters.</p>}
        </div>
        {formError && (
          <p className="form-err" role="alert">
            {formError}
          </p>
        )}
        <button className="btn btn-ink" type="submit" disabled={busy}>
          {busy ? "Creating your account…" : "Create account"}
        </button>
      </form>
      <p className="alt">
        Already have an account? <Link href={withNext("/login")}>Log in</Link>
      </p>
    </AuthShell>
  );
}
