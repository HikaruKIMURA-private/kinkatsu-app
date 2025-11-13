"use client";

import { createAuthClient } from "better-auth/react";

// デバッグ用: baseURLを確認
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
if (typeof window !== "undefined") {
  console.log("[Auth Client] baseURL:", baseURL);
}

export const authClient = createAuthClient({
  baseURL,
});
