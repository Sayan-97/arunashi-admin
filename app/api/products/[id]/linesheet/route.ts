import { NextResponse } from "next/server";
import { getAuthCookieHeader } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const backendUrl = process.env.API_URL || "http://localhost:8000";

  try {
    const formData = await request.formData();
    const res = await fetch(`${backendUrl}/api/products/${id}/linesheet`, {
      method: "PUT",
      headers: {
        Cookie: await getAuthCookieHeader(),
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to save linesheet" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Linesheet update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
