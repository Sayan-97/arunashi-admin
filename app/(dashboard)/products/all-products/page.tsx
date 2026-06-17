import { Bell, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { ProductActions } from "@/components/products/ProductActions";
import { getShopifyProducts } from "@/services/products";

interface ShopifyProduct {
  id: number | string;
  title: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  status: string;
  isActivated?: boolean;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string | null;
    inventory_quantity?: number;
  }>;
  image?: {
    src: string;
  } | null;
  images?: Array<{
    src: string;
  }>;
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col bg-white">
          {/* Header Skeleton */}
          <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-medium text-[#111111] font-sans">
                All Products
              </h1>
              <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#868686] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Loading...
              </span>
            </div>
            <button
              type="button"
              className="p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50"
            >
              <Bell className="size-5" />
            </button>
          </header>
          {/* Main Skeleton */}
          <main className="flex-1 p-10 space-y-6 overflow-y-auto bg-[#FAF9F6]/30">
            <div className="flex items-center justify-center py-20 text-[#868686]">
              Loading all products...
            </div>
          </main>
        </div>
      }
    >
      <AllProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AllProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const query = (await searchParams).search || "";
  const pageParam = (await searchParams).page || "1";
  const currentPage = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const cookieStore = await cookies();
  const products: ShopifyProduct[] = await getShopifyProducts(
    cookieStore.toString(),
  );

  // Filter for only active products
  const activeProducts = products.filter(
    (product) => product.status?.toLowerCase() === "active",
  );
  const activeCount = activeProducts.length;

  // Filter by query (title, handle, vendor, type, SKU)
  const filteredProducts = activeProducts.filter((product) => {
    const q = query.toLowerCase();
    const matchesSku = product.variants?.some((v) =>
      (v.sku || "").toLowerCase().includes(q),
    );
    return (
      product.title.toLowerCase().includes(q) ||
      product.handle.toLowerCase().includes(q) ||
      product.vendor.toLowerCase().includes(q) ||
      product.product_type.toLowerCase().includes(q) ||
      matchesSku
    );
  });

  const totalResults = filteredProducts.length;
  const limit = 8;
  const totalPages = Math.ceil(totalResults / limit) || 1;
  const safePage = Math.min(currentPage, totalPages);

  // Slice products for the current page
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * limit,
    safePage * limit,
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-[#111111] font-sans">
            All Products
          </h1>
          <span className="bg-[#FAF9F6] border border-[#EEEEEE] text-[#627426] text-xs font-semibold px-2.5 py-0.5 rounded-full animate-in fade-in duration-200">
            {activeCount} Active
          </span>
        </div>
        <button
          type="button"
          className="p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50"
        >
          <Bell className="size-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-6 overflow-y-auto bg-[#FAF9F6]/30">
        {/* Search Bar */}
        <form method="GET" className="relative w-full max-w-[360px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#868686]" />
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search products..."
            className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
          />
          {/* Preserve page param on new search */}
          <input type="hidden" name="page" value="1" />
        </form>

        {/* Table Container */}
        <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EEEEEE] sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                    Product
                  </th>
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                    Product Type
                  </th>
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                    Inventory
                  </th>
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                    Price
                  </th>
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                    Status
                  </th>
                  <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const imageSrc =
                      product.image?.src || product.images?.[0]?.src || "";
                    const price = product.variants?.[0]?.price;
                    const formattedPrice = price
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(price))
                      : "N/A";
                    const sku = product.variants?.[0]?.sku || "N/A";
                    const totalInventory =
                      product.variants?.reduce(
                        (sum, v) => sum + (v.inventory_quantity || 0),
                        0,
                      ) ?? 0;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Product details */}
                        <td className="py-5 px-6 align-middle">
                          <div className="flex items-center gap-4">
                            {/* Image */}
                            <div className="size-16 shrink-0 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[6px] overflow-hidden flex items-center justify-center p-1">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={product.title}
                                  className="size-full object-contain"
                                />
                              ) : (
                                <div className="text-[10px] text-[#868686] font-medium font-sans">
                                  No Image
                                </div>
                              )}
                            </div>
                            {/* Title and Handle / first SKU */}
                            <div className="min-w-0">
                              <div className="font-semibold text-[15px] text-[#111111] leading-snug flex items-center gap-2">
                                <span
                                  className={`size-2 shrink-0 rounded-full ${
                                    product.isActivated
                                      ? "bg-[#4ade80]"
                                      : "bg-[#868686]/40"
                                  }`}
                                  title={
                                    product.isActivated
                                      ? "Activated"
                                      : "Deactivated"
                                  }
                                />
                                <span className="truncate max-w-[300px]">
                                  {product.title}
                                </span>
                              </div>
                              <div className="text-[12px] text-[#868686] mt-0.5 font-normal pl-4">
                                SKU: {sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Product Type */}
                        <td className="py-5 px-6 align-middle font-medium text-[15px] text-[#3a3a3a]">
                          {product.product_type || "N/A"}
                        </td>

                        {/* Inventory */}
                        <td className="py-5 px-6 align-middle text-[14px] text-[#3a3a3a] font-mono">
                          {totalInventory}
                        </td>

                        {/* Price */}
                        <td className="py-5 px-6 align-middle font-semibold text-[15px] text-[#111111] font-mono">
                          {formattedPrice}
                        </td>

                        {/* Status */}
                        <td className="py-5 px-6 align-middle">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              product.isActivated
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.isActivated ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-5 px-6 align-middle text-right relative">
                          <ProductActions product={product} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-[#868686]"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          {totalPages > 0 && paginatedProducts.length > 0 && (
            <div className="h-16 px-6 border-t border-[#EEEEEE] flex items-center justify-between bg-white select-none">
              <span className="text-[14px] text-[#868686]">
                Showing {Math.min(totalResults, (safePage - 1) * limit + 1)} to{" "}
                {Math.min(totalResults, safePage * limit)} of {totalResults}{" "}
                results
              </span>

              <div className="inline-flex items-center gap-1.5">
                {/* Previous Page */}
                <Link
                  href={
                    safePage > 1
                      ? `?search=${encodeURIComponent(query)}&page=${safePage - 1}`
                      : "#"
                  }
                  className={`size-8 rounded-[6px] border border-[#E5E5E5] flex items-center justify-center transition-all ${
                    safePage > 1
                      ? "text-[#3a3a3a] hover:bg-gray-50 cursor-pointer"
                      : "text-gray-300 pointer-events-none"
                  }`}
                >
                  <ChevronLeft className="size-4" />
                </Link>

                {/* Page Numbers */}
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 4) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    pages.push(2);
                    if (safePage > 3) {
                      pages.push("...");
                    }
                    if (safePage > 2 && safePage < totalPages) {
                      pages.push(safePage);
                    }
                    if (safePage < totalPages - 1) {
                      pages.push("...");
                    }
                    pages.push(totalPages);
                  }
                  const uniquePages = Array.from(new Set(pages));

                  return uniquePages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={`dots-${idx}`}
                          className="size-8 flex items-center justify-center text-sm text-[#868686] select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    const active = p === safePage;
                    return (
                      <Link
                        key={p}
                        href={`?search=${encodeURIComponent(query)}&page=${p}`}
                        className={`size-8 rounded-[6px] text-sm flex items-center justify-center font-medium transition-all ${
                          active
                            ? "bg-[#EEEEE2] text-[#627426] border border-transparent font-semibold"
                            : "text-[#3a3a3a] border border-[#E5E5E5] hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  });
                })()}

                {/* Next Page */}
                <Link
                  href={
                    safePage < totalPages
                      ? `?search=${encodeURIComponent(query)}&page=${safePage + 1}`
                      : "#"
                  }
                  className={`size-8 rounded-[6px] border border-[#E5E5E5] flex items-center justify-center transition-all ${
                    safePage < totalPages
                      ? "text-[#3a3a3a] hover:bg-gray-50 cursor-pointer"
                      : "text-gray-300 pointer-events-none"
                  }`}
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
