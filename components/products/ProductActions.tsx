"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateProductsCache } from "@/actions/products";

interface ShopifyProduct {
  id: number | string;
  title: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  status: string;
  body_html?: string;
  isActivated?: boolean;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string | null;
    inventory_quantity?: number;
  }>;
  options?: Array<{
    id: number;
    name: string;
    values: string[];
  }>;
  image?: {
    src: string;
  } | null;
  images?: Array<{
    id?: number | string;
    src: string;
  }>;
}

interface ProductActionsProps {
  product: ShopifyProduct;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (activate: boolean) => {
    setIsMenuOpen(false);
    setIsPending(true);

    const toastId = toast.loading(
      `${activate ? "Activating" : "Deactivating"} product...`,
      {
        position: "top-right",
      },
    );

    try {
      const endpoint = activate ? "activate" : "deactivate";
      const res = await fetch(`/api/products/${product.id}/${endpoint}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(
          data.message ||
            `Failed to ${activate ? "activate" : "deactivate"} product`,
          {
            id: toastId,
          },
        );
        return;
      }

      toast.success(
        `Product ${activate ? "activated" : "deactivated"} successfully`,
        {
          id: toastId,
        },
      );

      await revalidateProductsCache();
      router.refresh();
    } catch (_error) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1.5 text-[#868686] hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
        disabled={isPending}
      >
        <MoreVertical className="size-[18px]" />
      </button>

      {isMenuOpen && (
        <>
          {/* Click outside backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-36 bg-white border border-[#EEEEEE] rounded-[6px] shadow-lg py-1 z-40 text-left">
            <Link
              href={`/products/${product.handle}`}
              className="block w-full text-left px-4 py-2 text-sm text-[#3a3a3a] hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                product.isActivated
                  ? "text-[#868686] opacity-50 cursor-not-allowed"
                  : "text-[#3a3a3a] hover:bg-gray-50 hover:text-black"
              }`}
              disabled={isPending || product.isActivated}
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                !product.isActivated
                  ? "text-[#868686] opacity-50 cursor-not-allowed"
                  : "text-[#3a3a3a] hover:bg-gray-50 hover:text-black"
              }`}
              disabled={isPending || !product.isActivated}
            >
              Deactivate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
