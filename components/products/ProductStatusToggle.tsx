"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateProductsCache } from "@/actions/products";

interface ProductStatusToggleProps {
  productId: string | number;
  isActivated: boolean;
}

export function ProductStatusToggle({
  productId,
  isActivated: initialIsActivated,
}: ProductStatusToggleProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialIsActivated);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    const nextState = !enabled;
    setLoading(true);

    try {
      const endpoint = nextState ? "activate" : "deactivate";
      const res = await fetch(`/api/products/${productId}/${endpoint}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(
          data.message ||
            `Failed to ${nextState ? "activate" : "deactivate"} product`,
          {
            position: "top-right",
          },
        );
        return;
      }

      setEnabled(nextState);
      toast.success(
        `Product ${nextState ? "activated" : "deactivated"} successfully`,
        {
          position: "top-right",
        },
      );

      await revalidateProductsCache();
      router.refresh();
    } catch (_error) {
      toast.error("An unexpected error occurred", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 select-none ${
        enabled ? "bg-[#627426]" : "bg-gray-200"
      }`}
    >
      <span className="sr-only">Toggle product status</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-flex items-center justify-center size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {loading && (
          <svg
            className="animate-spin size-3 text-[#627426]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
