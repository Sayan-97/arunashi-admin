"use server";

import { updateTag } from "next/cache";

export async function syncNow() {
  try {
    // Revalidate relevant cache tags
    updateTag("product-requests");
    updateTag("pending-approvals");
    updateTag("approved-retailers");

    // Simulate API delay or fetching shopify update
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true };
  } catch (error) {
    console.error("Sync Error:", error);
    return { error: "Failed to synchronize products" };
  }
}
