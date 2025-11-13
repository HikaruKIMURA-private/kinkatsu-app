import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

// better-auth の設定
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.BETTER_AUTH_ORIGIN ||
    "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "BetterAuthUser",
  },
  session: {
    modelName: "BetterAuthSession",
  },
  account: {
    modelName: "BetterAuthAccount",
  },
  verification: {
    modelName: "BetterAuthVerification",
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

// セッションからユーザーIDを取得するヘルパー関数
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return session?.user?.id || null;
}

// セッションからユーザー情報を取得するヘルパー関数（デバッグ用）
export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return session?.user || null;
}

// 現在のユーザーを取得（Task 4 では骨子のみ）
export async function getCurrentUser() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) return null;

  // Task 5 で完全実装（upsert 処理）
  // 今は骨子のみ
  return null;
}
