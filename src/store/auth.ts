"use client";

import { useCallback } from "react";
import type { User } from "@/lib/types";
import { amiApi, useMeQuery } from "./api";
import { useAppDispatch, useAppSelector } from "./index";
import { signedIn, signedOut } from "./session";

/**
 * The shared test account. Every Log in and Sign up button signs in as this account straight away,
 * with no form. The backend must have this account seeded. Override it with
 * NEXT_PUBLIC_TEST_ACCOUNT_EMAIL and NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD.
 */
const TEST_ACCOUNT = {
  email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL ?? "tolu@demo.ami",
  password: process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD ?? "demo1234",
};

// Several components may ask for the test login at once; they all share one request
let pendingTestLogin: Promise<User> | null = null;

/** Who is logged in, plus log in (test account) and log out. Backed by the Redux store. */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isError } = useMeQuery();
  const isSignedOut = useAppSelector((s) => s.session.signedOut);

  const logout = useCallback(async () => {
    dispatch(signedOut());
    await dispatch(amiApi.endpoints.logout.initiate()).unwrap().catch(() => {});
  }, [dispatch]);

  const loginWithTestAccount = useCallback(() => {
    pendingTestLogin ??= dispatch(amiApi.endpoints.login.initiate(TEST_ACCOUNT))
      .unwrap()
      .then(({ user }) => {
        dispatch(signedIn());
        return user;
      })
      .finally(() => {
        pendingTestLogin = null;
      });
    return pendingTestLogin;
  }, [dispatch]);

  return {
    user: data?.user ?? null,
    ready: isSuccess || isError,
    signedOut: isSignedOut,
    logout,
    loginWithTestAccount,
  };
}
