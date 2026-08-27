"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import {
  SignupVariantKey,
  isSignupVariantKey,
  pickRandomSignupVariant,
} from "@/lib/signupVariants";

const STORAGE_KEY = "signup_form_variant";

// Assigns a visitor to a signup-form variant once per browser session
// (sessionStorage, so a refresh never reassigns or flickers) and fires a
// single "view" count per session on first assignment.
export function useSignupVariant(): SignupVariantKey | null {
  const [variant, setVariant] = useState<SignupVariantKey | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      // sessionStorage unavailable (privacy mode, etc.) — fall back to
      // an in-memory assignment for this render only.
    }

    if (isSignupVariantKey(stored)) {
      setVariant(stored);
      return;
    }

    const assigned = pickRandomSignupVariant();
    setVariant(assigned);

    try {
      window.sessionStorage.setItem(STORAGE_KEY, assigned);
    } catch {
      // ignore
    }

    fetch("/api/signup-variant/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant: assigned }),
    }).catch(() => {
      // best-effort; missing a view count shouldn't block the page
    });

    posthog.capture("signup_form_viewed", { variant: assigned });
  }, []);

  return variant;
}
