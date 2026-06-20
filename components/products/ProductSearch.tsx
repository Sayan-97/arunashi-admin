"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (query === currentSearch) return; // Prevent infinite loop on searchParams change

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }
        // Always reset to page 1 on new search
        params.set("page", "1");

        router.replace(`?${params.toString()}`);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-[360px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#868686]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="size-4 rounded-full border-2 border-[#868686]/30 border-t-[#627426] animate-spin" />
        </div>
      )}
    </div>
  );
}
