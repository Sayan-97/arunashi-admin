import { NextResponse } from "next/server";
import { getAuthCookieHeader } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/products/${id}/deactivate`, {
      method: "POST",
      headers: {
        Cookie: await getAuthCookieHeader(),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to deactivate product" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Deactivate product error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
