"use server";

import { updateTag } from "next/cache";

export async function revalidateProductsCache() {
  updateTag("shopify-products");
  return { success: true };
}
