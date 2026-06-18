import { cookies } from "next/headers";

/**
 * Returns the formatted cookie string containing only the arunashi admin tokens.
 * This ensures backend requests do not mistakenly receive storefront tokens.
 */
export async function getAuthCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("arunashiAdminAccessToken")?.value;
  const refreshToken = cookieStore.get("arunashiAdminRefreshToken")?.value;

  const cookieParts = [];
  if (accessToken) cookieParts.push(`arunashiAdminAccessToken=${accessToken}`);
  if (refreshToken)
    cookieParts.push(`arunashiAdminRefreshToken=${refreshToken}`);

  return cookieParts.join("; ");
}
