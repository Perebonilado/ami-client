"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ApiError } from "./api";

function toApiError(e: unknown) {
  return e instanceof ApiError ? e : new ApiError(e instanceof Error ? e.message : "Something went wrong. Try again.", 500);
}

interface State<T> {
  key: string | null; // which deps the data/error belongs to
  data: T | null;
  error: ApiError | null;
}

/**
 * Small data hook: runs `load` on mount and whenever `deps` change.
 * `loading` is true until the result for the current deps arrives.
 */
export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });
  const loadRef = useRef(load);
  const keyRef = useRef(key);
  useLayoutEffect(() => {
    loadRef.current = load;
    keyRef.current = key;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ key, data, error: null });
      },
      (e) => {
        if (!cancelled) setState((s) => ({ key, data: s.data, error: toApiError(e) }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  /** Fetch again and wait for the fresh result. */
  const reload = useCallback(async () => {
    try {
      const data = await loadRef.current();
      setState({ key: keyRef.current, data, error: null });
    } catch (e) {
      setState((s) => ({ ...s, key: keyRef.current, error: toApiError(e) }));
    }
  }, []);

  const setData = useCallback((data: T) => setState((s) => ({ ...s, data })), []);

  return { data: state.data, error: state.key === key ? state.error : null, loading: state.key !== key, reload, setData };
}
