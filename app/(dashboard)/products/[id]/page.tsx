import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAuthCookieHeader } from "@/lib/auth";
import { getShopifyProducts } from "@/services/products";
import { ProductDetailsClient } from "./ProductDetailsClient";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col bg-white">
          <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center gap-4 select-none">
            <div className="size-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#3a3a3a]">
              <ChevronLeft className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-medium text-[#868686] font-sans">
                  Loading product...
                </h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-10 overflow-y-auto bg-white" />
        </div>
      }
    >
      <ProductDetailsWrapper params={params} />
    </Suspense>
  );
}

async function ProductDetailsWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getShopifyProducts(await getAuthCookieHeader());
  const product = products.find((p: any) => String(p.id) === id);

  if (!product) {
    return notFound();
  }

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

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center gap-4 select-none">
        <Link
          href="/products/active-products"
          className="size-8 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#3a3a3a] hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-nunito text-gray-900">
              {product.title}
            </h1>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                product.status?.toLowerCase() === "active"
                  ? "bg-[#627426]/10 text-[#627426] border border-[#627426]/20"
                  : "bg-gray-100 text-gray-700 border border-transparent"
              }`}
            >
              {product.status}
            </span>
          </div>
          <p className="text-xs text-[#868686] font-mono uppercase tracking-wider mt-1">
            ID: {product.id} • Created on{" "}
            {formatDate(product.created_at || (product as any).createdAt)}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <ProductDetailsClient initialProduct={product} />
      </main>
    </div>
  );
}
