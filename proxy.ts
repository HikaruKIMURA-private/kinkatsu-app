import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/login"];
const excludedPaths = ["/api", "/_next", "/favicon.ico"];

// https://www.better-auth.com/docs/integrations/next#nextjs-16-compatibility
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // apiや画像をのぞくすべての画面
  const isExcluded =
    excludedPaths.some((path) => pathname.startsWith(path)) ||
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(pathname);

  if (isExcluded) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const isPrivateRoute = !publicRoutes.includes(pathname);

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie && isPrivateRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // すべてのルートに適用（middleware内で除外処理）
  matcher: [
    /*
      - `/api*` → middleware内で除外
      - static/image系 → middleware内で除外
      - それ以外のすべての画面ルートで適用
    */
    "/(.*)",
  ],
};
