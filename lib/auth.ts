import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { cookies } from "next/headers";
import { baseUrl } from "./base-url";
import { prisma } from "./prisma";

// better-auth の設定（デフォルト命名を使用）
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  passkey: {
    modelName: "Passkey",
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
  plugins: [nextCookies()],
});

// セッションからユーザーIDを取得するヘルパー関数
export async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const session = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
      },
    });

    return session?.user?.id || null;
  } catch (error) {
    // セッション取得エラーは無視してnullを返す（未認証として扱う）
    console.error("Failed to get session user ID:", error);
    return null;
  }
}

// セッションからユーザー情報を取得するヘルパー関数（デバッグ用）
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
      },
    });

    return session?.user || null;
  } catch (error) {
    // セッション取得エラーは無視してnullを返す（未認証として扱う）
    console.error("Failed to get session user:", error);
    return null;
  }
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return null;

    // better-auth の User を直接取得
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
    });

    return user;
  } catch (error) {
    // データベースエラーやその他のエラーをログに記録
    console.error("Failed to get current user:", error);
    // エラー時はnullを返して未認証として扱う
    return null;
  }
}
