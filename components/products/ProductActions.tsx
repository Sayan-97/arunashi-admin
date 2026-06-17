"use client";

import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateProductsCache } from "@/actions/products";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const statusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "archived":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

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
    <>
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
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDialogOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#3a3a3a] hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
              >
                View
              </button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-3xl bg-white border border-[#EEEEEE] rounded-[10px] p-6 max-h-[90vh] flex flex-col gap-5 overflow-hidden shadow-xl"
        >
          <DialogHeader className="pb-4 flex flex-col gap-1.5 text-left border-b border-[#EEEEEE]">
            <DialogTitle className="text-xl font-medium text-[#111111] font-sans flex items-center gap-3">
              <span>{product.title}</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${statusColors(product.status)}`}
              >
                {product.status}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#868686] font-mono uppercase tracking-wider">
              ID: {product.id} • Created on {formatDate(product.created_at)}
            </DialogDescription>
          </DialogHeader>

          {/* Content Body - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 scrollbar-thin min-h-0">
            {/* Images Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-1.5">
                  Images
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((img, index) => (
                    <div
                      key={img.id || index}
                      className="size-32 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[8px] overflow-hidden flex items-center justify-center p-2 shrink-0"
                    >
                      <img
                        src={img.src}
                        alt=""
                        className="size-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-4 text-sm">
              <div>
                <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                  Vendor
                </span>
                <span className="font-semibold block mt-0.5 text-[#111111]">
                  {product.vendor || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                  Product Type
                </span>
                <span className="font-semibold block mt-0.5 text-[#111111]">
                  {product.product_type || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                  Handle
                </span>
                <span className="font-semibold block mt-0.5 text-[#111111] break-all">
                  {product.handle}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                  First variant SKU
                </span>
                <span className="font-semibold block mt-0.5 text-[#111111]">
                  {product.variants?.[0]?.sku || "N/A"}
                </span>
              </div>
            </div>

            {/* Description (body_html) */}
            {product.body_html && product.body_html.trim().length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-1.5">
                  Description
                </h4>
                <div
                  className="text-sm text-[#3a3a3a] leading-relaxed prose prose-sm max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: product.body_html }}
                />
              </div>
            )}

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-1.5">
                  Product Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="text-sm bg-gray-50/50 border border-[#EEEEEE] rounded-[6px] p-3"
                    >
                      <span className="text-[#868686] text-xs font-semibold block uppercase tracking-wider mb-1">
                        {opt.name}
                      </span>
                      <span className="font-semibold text-[#111111]">
                        {opt.values?.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-1.5">
                  Product Variants
                </h4>
                <div className="border border-[#EEEEEE] rounded-[8px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#EEEEEE]">
                          <th className="py-2.5 px-3 font-semibold text-[#868686] w-1/3">
                            Title
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-[#868686] w-1/4">
                            SKU
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-[#868686] w-1/4">
                            Price
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-[#868686] text-right w-1/6">
                            Inventory
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant) => (
                          <tr
                            key={variant.id}
                            className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50"
                          >
                            <td className="py-2.5 px-3 font-medium text-[#3a3a3a]">
                              {variant.title}
                            </td>
                            <td className="py-2.5 px-3 text-mono text-gray-500">
                              {variant.sku || "N/A"}
                            </td>
                            <td className="py-2.5 px-3 font-semibold font-mono text-[#111111]">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(variant.price))}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-500 font-mono">
                              {variant.inventory_quantity ?? "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-[#EEEEEE] pt-4 flex items-center justify-end gap-3 select-none">
            <DialogClose asChild>
              <button
                type="button"
                className="h-10 px-5 rounded-[6px] border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 transition-all text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
