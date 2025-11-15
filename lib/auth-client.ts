"use client";

import { createAuthClient } from "better-auth/react";
import { baseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: baseUrl(),
});
