import { NextResponse } from "next/server";
import { getAuthCookieHeader } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { link } = await request.json();
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/products/${id}/linesheet`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: await getAuthCookieHeader(),
      },
      body: JSON.stringify({ link }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to save linesheet link" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Linesheet link update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
