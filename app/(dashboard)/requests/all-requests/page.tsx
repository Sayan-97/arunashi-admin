import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DebouncedSearch } from "@/components/dashboard/DebouncedSearch";
import { DownloadCsvButton } from "@/components/dashboard/DownloadCsvButton";
import { NotificationMenu } from "@/components/dashboard/NotificationMenu";
import { ViewRequestButton } from "@/components/dashboard/ViewRequestButton";
import { getAuthCookieHeader } from "@/lib/auth";
import { getAllProductRequests } from "@/services/requests";

interface ProductRequest {
  id: string;
  items: any;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

export default function AllRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; open?: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          All Product Requests
        </h1>
        <NotificationMenu />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-6 overflow-y-auto bg-[#FAF9F6]/30">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-[#868686]">
              Loading requests...
            </div>
          }
        >
          <AllRequestsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function AllRequestsContent({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; open?: string }>;
}) {
  const openRequestId = (await searchParams).open || "";
  const query = (await searchParams).search || "";
  const pageParam = (await searchParams).page || "1";
  const currentPage = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  let requests: ProductRequest[] = [];
  try {
    requests = await getAllProductRequests(await getAuthCookieHeader());
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      const cookieStore = await cookies();
      cookieStore.delete("arunashiAdminAccessToken");
      cookieStore.delete("arunashiAdminRefreshToken");
      redirect("/login");
    }
    throw err;
  }

  // Filter by query (ID, Retailer company, Retailer name, or email)
  const filteredRequests = requests.filter((req) => {
    const q = query.toLowerCase();
    const formattedId = req.id.split("-")[0].substring(0, 7).toUpperCase();
    return (
      formattedId.toLowerCase().includes(q) ||
      req.user.name.toLowerCase().includes(q) ||
      req.user.email.toLowerCase().includes(q) ||
      (req.user.company || "").toLowerCase().includes(q)
    );
  });

  const totalResults = filteredRequests.length;
  const limit = 8;
  const totalPages = Math.ceil(totalResults / limit) || 1;
  const safePage = Math.min(currentPage, totalPages);

  // Slice requests for the current page
  const paginatedRequests = filteredRequests.slice(
    (safePage - 1) * limit,
    safePage * limit,
  );

  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to format time
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Search and Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap w-full">
        <DebouncedSearch placeholder="Search for requests..." />
        <DownloadCsvButton
          filename="all-requests.csv"
          headers={[
            "Request ID",
            "Retailer Name",
            "Retailer Email",
            "Retailer Company",
            "Status",
            "Date Requested",
            "Last Updated",
            "Requested Products",
          ]}
          rows={filteredRequests.map((r) => {
            const items = Array.isArray(r.items) ? r.items : [];
            const itemsStr = items
              .map(
                (item: any) =>
                  `${item.name || "N/A"} (Item No: ${item.itemNo || "N/A"})`,
              )
              .join(" | ");
            return [
              r.id.split("-")[0].substring(0, 7).toUpperCase(),
              r.user.name,
              r.user.email,
              r.user.company || "",
              r.status,
              r.createdAt,
              r.updatedAt,
              itemsStr,
            ];
          })}
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEEEEE] sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Products
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Retailer
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider select-none">
                  Date Requested &darr;
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Status
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Last Updated
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => {
                  const items = Array.isArray(request.items)
                    ? request.items
                    : [];
                  const itemsCount = items.length;
                  const retailerName =
                    request.user.company || request.user.name;

                  return (
                    <tr
                      key={request.id}
                      className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Products */}
                      <td className="py-5 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          {/* Image Container */}
                          {itemsCount === 1 ? (
                            <div className="size-16 shrink-0 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[6px] overflow-hidden flex items-center justify-center p-1">
                              {items[0]?.image ? (
                                <img
                                  src={items[0].image}
                                  alt={items[0].name || ""}
                                  className="size-full object-contain"
                                />
                              ) : (
                                <div className="text-[10px] text-[#868686] font-medium font-sans">
                                  No Image
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 size-16 shrink-0 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[6px] p-0.5 overflow-hidden">
                              {/* First item */}
                              <div className="w-full h-full overflow-hidden flex items-center justify-center bg-white rounded-[2px]">
                                {items[0]?.image ? (
                                  <img
                                    src={items[0].image}
                                    alt=""
                                    className="size-full object-contain"
                                  />
                                ) : (
                                  <div className="text-[8px] text-[#868686] font-sans">
                                    -
                                  </div>
                                )}
                              </div>
                              {/* Second item */}
                              <div className="w-full h-full overflow-hidden flex items-center justify-center bg-white rounded-[2px]">
                                {items[1]?.image ? (
                                  <img
                                    src={items[1].image}
                                    alt=""
                                    className="size-full object-contain"
                                  />
                                ) : (
                                  <div className="text-[8px] text-[#868686] font-sans">
                                    -
                                  </div>
                                )}
                              </div>
                              {/* Third item */}
                              {itemsCount >= 3 ? (
                                <div className="w-full h-full overflow-hidden flex items-center justify-center bg-white rounded-[2px]">
                                  {items[2]?.image ? (
                                    <img
                                      src={items[2].image}
                                      alt=""
                                      className="size-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-[8px] text-[#868686] font-sans">
                                      -
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-50/30 rounded-[2px]" />
                              )}
                              {/* Fourth item / + count */}
                              {itemsCount > 3 ? (
                                <div className="w-full h-full flex items-center justify-center bg-[#EEEEE2] rounded-[2px] text-xs font-bold text-[#627426] font-sans select-none">
                                  +{itemsCount - 3}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-50/30 rounded-[2px]" />
                              )}
                            </div>
                          )}

                          {/* Name and Item No */}
                          <div className="min-w-0">
                            <div className="font-semibold text-[15px] text-[#111111] leading-snug truncate max-w-[200px]">
                              {items[0]?.name || "N/A"}
                            </div>
                            <div className="text-[12px] text-[#868686] mt-0.5 font-normal">
                              Item No: {items[0]?.itemNo || "N/A"}{" "}
                              {itemsCount > 1 && `(+${itemsCount - 1} more)`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Retailer Info */}
                      <td className="py-5 px-6 align-middle font-semibold text-[15px] text-[#111111]">
                        {retailerName}
                      </td>

                      {/* Date Requested */}
                      <td className="py-5 px-6 align-middle">
                        <div className="text-[14px] text-[#3a3a3a]">
                          {formatDate(request.createdAt)}
                        </div>
                        <div className="text-[12px] text-[#868686] mt-0.5 font-normal">
                          {formatTime(request.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6 align-middle">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                            request.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : request.status === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : "bg-[#fff4cc] text-gray-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-5 px-6 align-middle">
                        <div className="text-[14px] text-[#3a3a3a]">
                          {formatDate(request.updatedAt)}
                        </div>
                        <div className="text-[12px] text-[#868686] mt-0.5 font-normal">
                          {formatTime(request.updatedAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 align-middle text-right">
                        <div className="inline-flex items-center gap-2">
                          <ViewRequestButton
                            request={request}
                            defaultOpen={request.id === openRequestId}
                          />
                          <button
                            type="button"
                            className="p-1.5 text-[#868686] hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                          >
                            <MoreVertical className="size-[18px]" />
                          </button>
                        </div>
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
                    No product requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {totalPages > 0 && paginatedRequests.length > 0 && (
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
    </>
  );
}
