import {
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ViewRequestButton } from "@/components/dashboard/ViewRequestButton";
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

export default function PendingRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; open?: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between select-none">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          Pending Product Requests
        </h1>
        <button
          type="button"
          className="p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50"
        >
          <Bell className="size-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-6 overflow-y-auto bg-[#FAF9F6]/30">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-[#868686]">
              Loading pending requests...
            </div>
          }
        >
          <PendingRequestsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function PendingRequestsContent({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; open?: string }>;
}) {
  const openRequestId = (await searchParams).open || "";
  const query = (await searchParams).search || "";
  const pageParam = (await searchParams).page || "1";
  const currentPage = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const cookieStore = await cookies();
  const hasToken = cookieStore.has("arunashiAdminAccessToken");
  if (!hasToken) {
    redirect("/login");
  }

  let requests: ProductRequest[] = [];
  try {
    requests = await getAllProductRequests(cookieStore.toString());
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      cookieStore.delete("arunashiAdminAccessToken");
      cookieStore.delete("arunashiAccessToken");
      cookieStore.delete("arunashiAdminRefreshToken");
      cookieStore.delete("arunashiRefreshToken");
      redirect("/login");
    }
    throw err;
  }

  // Filter for only PENDING requests
  const pendingRequests = requests.filter((req) => req.status === "PENDING");

  // Filter by query (ID, Retailer company, Retailer name, or email)
  const filteredRequests = pendingRequests.filter((req) => {
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

  // Helper to format ID
  const formatRequestId = (uuid: string) => {
    return `REQ-${uuid.split("-")[0].substring(0, 4).toUpperCase()}`;
  };

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

  // Helper to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Search Bar */}
      <form method="GET" className="relative w-full max-w-[360px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#868686]" />
        <input
          type="text"
          name="search"
          defaultValue={query}
          placeholder="Search for requests"
          className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
        />
        {/* Preserve page param on new search */}
        <input type="hidden" name="page" value="1" />
      </form>

      {/* Table Container */}
      <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto max-h-[580px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEEEEE] sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Request ID
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Retailer
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Products
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Request Type
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
                  const hasNotes = items.some(
                    (item: any) => item.notes && item.notes.trim().length > 0,
                  );
                  const requestType = hasNotes ? "Custom Quote" : "Wholesale";
                  const retailerName =
                    request.user.company || request.user.name;

                  return (
                    <tr
                      key={request.id}
                      className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Request ID */}
                      <td className="py-5 px-6 align-middle font-mono text-sm text-[#3a3a3a]">
                        {formatRequestId(request.id)}
                      </td>

                      {/* Retailer Info */}
                      <td className="py-5 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="size-9 bg-[#F4F3EB] text-[#7A7550] rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none">
                            {getInitials(retailerName)}
                          </div>
                          <div>
                            <div className="font-semibold text-[15px] text-[#111111]">
                              {retailerName}
                            </div>
                            <div className="text-[13px] text-[#868686] mt-0.5 font-normal">
                              {request.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="py-5 px-6 align-middle text-[14px] text-[#3a3a3a] font-medium">
                        {itemsCount} {itemsCount === 1 ? "Product" : "Products"}
                      </td>

                      {/* Request Type */}
                      <td className="py-5 px-6 align-middle">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-[4px] text-xs font-semibold ${
                            requestType === "Custom Quote"
                              ? "bg-[#EDF2FA] text-[#2F65B6]"
                              : "bg-[#EEF7EC] text-[#487E3E]"
                          }`}
                        >
                          {requestType}
                        </span>
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
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#fff4cc] text-gray-800">
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
                    colSpan={8}
                    className="py-12 text-center text-sm text-[#868686]"
                  >
                    No pending product requests found.
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
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
              })}

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
