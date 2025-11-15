"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import { baseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: baseUrl(),
  plugins: [inferAdditionalFields<typeof auth>()],
});
