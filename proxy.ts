import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/activation-status",
  "/activate",
  "/submission",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  if (
    (pathname.startsWith("/api") && !pathname.startsWith("/api/email")) ||
    pathname.startsWith("/public/uploads")
  ) {
    const targetUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      backendUrl,
    );

    const requestHeaders = new Headers(request.headers);

    // Filter cookies to ONLY include arunashi admin cookies
    const access = request.cookies.get("arunashiAdminAccessToken")?.value;
    const refresh = request.cookies.get("arunashiAdminRefreshToken")?.value;
    const cookieParts = [];
    if (access) cookieParts.push(`arunashiAdminAccessToken=${access}`);
    if (refresh) cookieParts.push(`arunashiAdminRefreshToken=${refresh}`);

    if (cookieParts.length > 0) {
      requestHeaders.set("Cookie", cookieParts.join("; "));
    } else {
      requestHeaders.delete("Cookie");
    }

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isStaticOrSystem =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isStaticOrSystem) {
    return NextResponse.next();
  }

  const accessTokenCookie = request.cookies.get("arunashiAdminAccessToken");
  const refreshTokenCookie = request.cookies.get("arunashiAdminRefreshToken");

  let isAccessTokenValid = false;

  if (accessTokenCookie?.value) {
    try {
      const tokenParts = accessTokenCookie.value.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          isAccessTokenValid = true;
        }
      }
    } catch (_e) {
      // Invalid token format
    }
  }

  let response = NextResponse.next();

  if (!isAccessTokenValid) {
    if (refreshTokenCookie?.value) {
      try {
        const refreshRes = await fetch(`${backendUrl}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `arunashiAdminRefreshToken=${refreshTokenCookie.value}`,
          },
        });

        if (refreshRes.ok) {
          const newSetCookies = refreshRes.headers.getSetCookie();

          if (isAuthRoute) {
            response = NextResponse.redirect(new URL("/", request.url));
          } else {
            const requestHeaders = new Headers(request.headers);
            const cookieParts: string[] = [];
            const parsedNewCookies = newSetCookies.map((c) =>
              c.split(";")[0].trim(),
            );

            request.cookies.getAll().forEach((c) => {
              if (!parsedNewCookies.some((nc) => nc.startsWith(`${c.name}=`))) {
                cookieParts.push(`${c.name}=${c.value}`);
              }
            });
            cookieParts.push(...parsedNewCookies);
            requestHeaders.set("Cookie", cookieParts.join("; "));

            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
          }

          for (const cookieStr of newSetCookies) {
            response.headers.append("Set-Cookie", cookieStr);
          }
        } else {
          if (!isAuthRoute) {
            response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("arunashiAdminAccessToken");
            response.cookies.delete("arunashiAdminRefreshToken");
          }
        }
      } catch (_e) {
        if (!isAuthRoute) {
          response = NextResponse.redirect(new URL("/login", request.url));
        }
      }
    } else {
      if (!isAuthRoute) {
        response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("arunashiAdminAccessToken");
        response.cookies.delete("arunashiAdminRefreshToken");
      }
    }
  } else {
    if (isAuthRoute) {
      response = NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
