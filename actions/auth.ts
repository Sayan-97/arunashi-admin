"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ActionState {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string;
  };
  success?: boolean;
}

export async function login(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: { email?: string[]; password?: string[]; form?: string } = {};

  if (!email || !email.includes("@")) {
    errors.email = ["Please enter a valid email address"];
  }
  if (!password || password.length === 0) {
    errors.password = ["Password is required"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  let isSuccess = false;

  try {
    const backendUrl = process.env.API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error && typeof data.error === "object") {
        return {
          errors: data.error as { email?: string[]; password?: string[] },
        };
      }
      return {
        errors: {
          form: data.error || data.message || "Invalid credentials",
        },
      };
    }

    const setCookies = response.headers.getSetCookie();
    const cookieStore = await cookies();

    for (const cookieStr of setCookies) {
      const parts = cookieStr.split(";").map((p) => p.trim());
      const [nameValue, ...options] = parts;
      const eqIdx = nameValue.indexOf("=");
      if (eqIdx === -1) continue;
      const name = nameValue.substring(0, eqIdx);
      const value = nameValue.substring(eqIdx + 1);

      // biome-ignore lint/suspicious/noExplicitAny: options are dynamic
      const cookieOptions: any = {};
      for (const option of options) {
        const [optName, optVal] = option.split("=");
        const normalizedName = optName.toLowerCase();
        if (normalizedName === "path") {
          cookieOptions.path = optVal || "/";
        } else if (normalizedName === "httponly") {
          cookieOptions.httpOnly = true;
        } else if (normalizedName === "secure") {
          cookieOptions.secure = true;
        } else if (normalizedName === "max-age") {
          cookieOptions.maxAge = parseInt(optVal, 10);
        } else if (normalizedName === "samesite") {
          cookieOptions.sameSite = optVal.toLowerCase() as
            | "lax"
            | "strict"
            | "none";
        } else if (normalizedName === "expires") {
          cookieOptions.expires = new Date(optVal);
        }
      }

      cookieStore.set(name, value, cookieOptions);
    }

    isSuccess = true;
  } catch (error) {
    console.error("Login Server Action Error:", error);
    return {
      errors: {
        form: "Could not connect to the authentication server.",
      },
    };
  }

  if (isSuccess) {
    redirect("/");
  }

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("adminAccessToken");
  cookieStore.delete("adminRefreshToken");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
}
