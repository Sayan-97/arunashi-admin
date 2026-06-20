import { NextResponse } from "next/server";
import { getAuthCookieHeader } from "@/lib/auth";

export async function POST(_request: Request) {
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/products/sync`, {
      method: "POST",
      headers: {
        Cookie: await getAuthCookieHeader(),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to sync products" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Sync products error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
