import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/activation-status",
  "/activate",
  "/submission",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/email")) {
    const backendUrl = process.env.API_URL || "http://localhost:8000";
    const targetUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      backendUrl,
    );

    return NextResponse.rewrite(targetUrl);
  }

  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isStaticOrSystem =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (!isStaticOrSystem) {
    if (!isAuthenticated && !isAuthRoute) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
