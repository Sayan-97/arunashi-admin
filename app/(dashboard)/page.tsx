import { Bell, FileText, RefreshCw, Search, UserPlus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { getAllProductRequests } from "@/services/requests";
import { getPendingApprovals } from "@/services/retailers";

interface Retailer {
  id: string;
  name: string;
  phone: string;
  company: string;
  email: string;
  createdAt: string;
}

interface ProductRequest {
  id: string;
  items: any;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

export default function DashboardHomePage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between">
        {/* Search Bar - Targets the pending approvals search functionality */}
        <form
          action="/retailers/pending-approvals"
          method="GET"
          className="relative w-full max-w-[360px] mx-auto lg:mx-0"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#868686]" />
          <input
            type="text"
            name="search"
            placeholder="Search for retailers"
            className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
          />
        </form>

        <button
          type="button"
          className="p-2 text-[#3a3a3a] hover:text-black transition-colors rounded-full hover:bg-gray-50"
        >
          <Bell className="size-5" />
        </button>
      </header>

      {/* Main Content Area with Suspense boundary to prevent Blocking Route errors */}
      <main className="flex-1 p-10 space-y-10 overflow-y-auto bg-[#FAF9F6]/30">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111] font-sans">
            Overview
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-[#868686]">
              Loading dashboard overview metrics...
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent() {
  const cookieStore = await cookies();
  const token = cookieStore.toString();

  // Guard: Redirect if cookies are empty
  const hasToken = cookieStore.has("adminAccessToken");
  if (!hasToken) {
    redirect("/login");
  }

  let pendingRetailers: Retailer[] = [];
  let allRequests: ProductRequest[] = [];

  try {
    pendingRetailers = await getPendingApprovals(token);
    allRequests = await getAllProductRequests(token);
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      cookieStore.delete("adminAccessToken");
      cookieStore.delete("accessToken");
      cookieStore.delete("adminRefreshToken");
      cookieStore.delete("refreshToken");
      redirect("/login");
    }
    throw err;
  }

  // Filter dynamic counts
  const pendingRequestsCount = allRequests.filter(
    (req) => req.status === "PENDING",
  ).length;

  // Format Helpers
  const formatRequestId = (uuid: string) => {
    return uuid.split("-")[0].substring(0, 7).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Limit to max recent records for dashboard layout
  const recentRequests = allRequests.slice(0, 4);
  const recentRetailers = pendingRetailers.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Pending Retailer Approvals */}
        <div className="bg-white border border-[#EEEEEE] rounded-[10px] p-6 shadow-sm flex items-center gap-5">
          <div className="size-[60px] shrink-0 bg-[#EEEEE2]/60 text-[#627426] rounded-full flex items-center justify-center">
            <UserPlus className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#868686] font-medium leading-none">
              Pending Retailor Approvals
            </p>
            <p className="text-3xl font-bold text-[#111111] mt-2 font-sans">
              {pendingRetailers.length}
            </p>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="bg-white border border-[#EEEEEE] rounded-[10px] p-6 shadow-sm flex items-center gap-5">
          <div className="size-[60px] shrink-0 bg-[#EEEEE2]/60 text-[#627426] rounded-full flex items-center justify-center">
            <FileText className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#868686] font-medium leading-none">
              Pending Requests
            </p>
            <p className="text-3xl font-bold text-[#111111] mt-2 font-sans">
              {pendingRequestsCount}
            </p>
          </div>
        </div>

        {/* Card 3: Sync Status */}
        <div className="bg-white border border-[#EEEEEE] rounded-[10px] p-6 shadow-sm flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="size-[60px] shrink-0 bg-[#EEEEE2]/60 text-[#627426] rounded-full flex items-center justify-center">
              <RefreshCw className="size-6" />
            </div>
            <div>
              <p className="text-sm text-[#868686] font-medium leading-none">
                Sync Status
              </p>
              <p className="text-[20px] font-bold text-[#111111] mt-2 font-sans leading-none">
                All Good
              </p>
            </div>
          </div>
          <div>
            <SyncButton />
          </div>
        </div>
      </div>

      {/* Lower Grid: Recent Requests & Recent Retailor Applications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
        {/* Left Column: Recent Requests */}
        <div className="xl:col-span-2 flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-[#111111] font-sans">
            Recent Requests
          </h2>
          <div className="flex-1 bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
            {recentRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEEE] bg-[#FAF9F6]/20">
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider">
                        Retailer
                      </th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider">
                        Products
                      </th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-[#868686] uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((request) => {
                      const itemsCount = Array.isArray(request.items)
                        ? request.items.length
                        : 0;

                      return (
                        <tr
                          key={request.id}
                          className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4.5 px-6 font-mono text-sm text-[#3a3a3a]">
                            {formatRequestId(request.id)}
                          </td>
                          <td className="py-4.5 px-6 font-semibold text-[15px] text-[#111111]">
                            {request.user.company || request.user.name}
                          </td>
                          <td className="py-4.5 px-6 text-[14px] text-[#3a3a3a]">
                            {itemsCount}{" "}
                            {itemsCount === 1 ? "Product" : "Products"}
                          </td>
                          <td className="py-4.5 px-6 text-[14px] text-[#3a3a3a]">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="py-4.5 px-6">
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
                          <td className="py-4.5 px-6 text-right">
                            <Link href="/requests">
                              <button
                                type="button"
                                className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white transition-all text-xs font-semibold cursor-pointer"
                              >
                                Review
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-12 text-sm text-[#868686]">
                No recent requests found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Retailor Applications */}
        <div className="xl:col-span-1 flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-[#111111] font-sans">
            Recent Retailor Applications
          </h2>
          <div className="flex-1 bg-white border border-[#EEEEEE] rounded-[10px] p-6 shadow-sm flex flex-col justify-between">
            {recentRetailers.length > 0 ? (
              <div className="space-y-4 flex-1">
                {recentRetailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className="flex items-center justify-between pb-4 last:pb-0 border-b border-[#EEEEEE] last:border-0"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Circle Avatar with Initials */}
                      <div className="size-10 rounded-full bg-[#627426] text-white flex items-center justify-center font-bold text-sm tracking-wide shrink-0">
                        {getInitials(retailer.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[#111111] leading-none truncate">
                          {retailer.name}
                        </p>
                        <p className="text-[13px] text-[#868686] mt-1 truncate">
                          {retailer.company}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link href="/retailers/pending-approvals">
                        <button
                          type="button"
                          className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white transition-all text-xs font-semibold cursor-pointer"
                        >
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-[#868686] py-10">
                No pending retailer applications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
