"use server";

import { updateTag } from "next/cache";

/**
 * Server Action to revalidate Next.js "use cache" tags from Client Components.
 */
export async function revalidateRealtimeTags(tags: string[]) {
  for (const tag of tags) {
    try {
      updateTag(tag);
    } catch (error) {
      console.error(`Error revalidating cache tag "${tag}":`, error);
    }
  }
}
