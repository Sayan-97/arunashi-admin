"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateCoords = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.right - 144 + window.scrollX, // 144px is width of w-36 dropdown
        });
      }
    };

    if (isMenuOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isMenuOpen]);

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
        ref={buttonRef}
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1.5 text-[#868686] hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
        disabled={isPending}
      >
        <MoreVertical className="size-[18px]" />
      </button>

      {isMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Click outside backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: "144px", // w-36
              }}
              className="bg-white border border-[#EEEEEE] rounded-[6px] shadow-lg py-1.5 z-[9999] text-left flex flex-col"
            >
              <Link
                href={`/products/${product.handle}`}
                onClick={() => setIsMenuOpen(false)}
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
          </>,
          document.body,
        )}
    </div>
  );
}
