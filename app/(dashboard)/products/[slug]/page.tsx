import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAuthCookieHeader } from "@/lib/auth";
import { getShopifyProducts } from "@/services/products";
import { LinesheetForm } from "./linesheet-form";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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
      <ProductDetailsContent params={params} />
    </Suspense>
  );
}

async function ProductDetailsContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getShopifyProducts(await getAuthCookieHeader());
  const product = products.find(
    (p: any) => p.handle === slug || String(p.id) === slug,
  );

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
            <h1 className="text-2xl font-medium text-[#111111] font-sans">
              {product.title}
            </h1>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${statusColors(
                product.status,
              )}`}
            >
              {product.status}
            </span>
          </div>
          <p className="text-xs text-[#868686] font-mono uppercase tracking-wider mt-1">
            ID: {product.id} • Created on {formatDate(product.created_at)}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-white">
        <div className="max-w-7xl space-y-10">
          {/* Images Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
                Images
              </h4>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                {product.images.map((img: any, index: number) => (
                  <div
                    key={img.id || index}
                    className="size-48 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[12px] overflow-hidden flex items-center justify-center p-3 shrink-0"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-6 text-sm">
            <div>
              <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                Vendor
              </span>
              <span className="font-semibold block mt-1 text-[#111111] text-base">
                {product.vendor || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                Product Type
              </span>
              <span className="font-semibold block mt-1 text-[#111111] text-base">
                {product.product_type || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                Handle
              </span>
              <span className="font-semibold block mt-1 text-[#111111] text-base break-all">
                {product.handle}
              </span>
            </div>
            <div>
              <span className="text-[#868686] text-xs block font-semibold uppercase tracking-wider">
                First variant SKU
              </span>
              <span className="font-semibold block mt-1 text-[#111111] text-base">
                {product.variants?.[0]?.sku || "N/A"}
              </span>
            </div>
          </div>

          {/* Description (body_html) */}
          {product.body_html && product.body_html.trim().length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
                Description
              </h4>
              <div
                className="text-base text-[#3a3a3a] leading-relaxed prose prose-sm max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: product.body_html }}
              />
            </div>
          )}

          {/* Linesheet Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
              Linesheet Link
            </h4>
            <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-5">
              <LinesheetForm
                productId={String(product.id)}
                initialLink={product.linesheetLink}
              />
            </div>
          </div>

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
                Product Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.options.map((opt: any) => (
                  <div
                    key={opt.id}
                    className="text-sm bg-gray-50/50 border border-[#EEEEEE] rounded-[6px] p-4"
                  >
                    <span className="text-[#868686] text-xs font-semibold block uppercase tracking-wider mb-1.5">
                      {opt.name}
                    </span>
                    <span className="font-semibold text-[#111111] text-base">
                      {opt.values?.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans border-b border-[#EEEEEE] pb-2">
                Product Variants
              </h4>
              <div className="border border-[#EEEEEE] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#EEEEEE]">
                        <th className="py-3 px-4 font-semibold text-[#868686] w-1/3">
                          Title
                        </th>
                        <th className="py-3 px-4 font-semibold text-[#868686] w-1/4">
                          SKU
                        </th>
                        <th className="py-3 px-4 font-semibold text-[#868686] w-1/4">
                          Price
                        </th>
                        <th className="py-3 px-4 font-semibold text-[#868686] text-right w-1/6">
                          Inventory
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant: any) => (
                        <tr
                          key={variant.id}
                          className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50"
                        >
                          <td className="py-3 px-4 font-medium text-[#3a3a3a]">
                            {variant.title}
                          </td>
                          <td className="py-3 px-4 text-mono text-gray-500">
                            {variant.sku || "N/A"}
                          </td>
                          <td className="py-3 px-4 font-semibold font-mono text-[#111111]">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(Number(variant.price))}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500 font-mono">
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
      </main>
    </div>
  );
}
