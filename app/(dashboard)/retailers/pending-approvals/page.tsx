import { Bell, MoreVertical, Search } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DownloadCsvButton } from "@/components/dashboard/DownloadCsvButton";
import { ApproveButton } from "@/components/retailers/ApproveButton";
import { getAuthCookieHeader } from "@/lib/auth";
import { getPendingApprovals } from "@/services/retailers";

interface Retailer {
  id: string;
  name: string;
  phone: string;
  company: string;
  email: string;
  createdAt: string;
}

export default function PendingApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <header className="h-[84px] shrink-0 border-b border-[#EEEEEE] px-10 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[#111111] font-sans">
          Pending Retailers Approvals
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
              Loading pending approvals...
            </div>
          }
        >
          <PendingApprovalsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function PendingApprovalsContent({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = (await searchParams).search || "";

  let pendingRetailers: Retailer[] = [];
  try {
    pendingRetailers = await getPendingApprovals(await getAuthCookieHeader());
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      const cookieStore = await cookies();
      cookieStore.delete("arunashiAdminAccessToken");
      cookieStore.delete("arunashiAdminRefreshToken");
      redirect("/login");
    }
    throw err;
  }

  const filteredRetailers = pendingRetailers.filter(
    (retailer) =>
      retailer.name.toLowerCase().includes(query.toLowerCase()) ||
      (retailer.company || "").toLowerCase().includes(query.toLowerCase()) ||
      retailer.email.toLowerCase().includes(query.toLowerCase()),
  );

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
        <form method="GET" className="relative w-full max-w-[360px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#868686]" />
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search for retailers"
            className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686] focus:outline-none focus:border-[#627426]/50 transition-colors"
          />
        </form>
        <DownloadCsvButton
          filename="pending-retailers.csv"
          headers={[
            "Retailer Name",
            "Phone",
            "Business Name",
            "Email",
            "Date Applied",
          ]}
          rows={filteredRetailers.map((r) => [
            r.name,
            r.phone || "",
            r.company || "",
            r.email,
            r.createdAt,
          ])}
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEEEEE] sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Retailers
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Business Name
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Email
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider">
                  Date Applied
                </th>
                <th className="py-4.5 px-6 text-[12px] font-semibold text-[#868686] capitalize tracking-wider text-right lg:text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRetailers.length > 0 ? (
                filteredRetailers.map((retailer) => (
                  <tr
                    key={retailer.id}
                    className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Retailer Info */}
                    <td className="py-5 px-6 align-middle">
                      <div className="font-semibold text-[15px] text-[#111111]">
                        {retailer.name}
                      </div>
                      <div className="text-[13px] text-[#868686] mt-0.5">
                        {retailer.phone}
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="py-5 px-6 align-middle font-medium text-[15px] text-[#3a3a3a]">
                      {retailer.company}
                    </td>

                    {/* Email */}
                    <td className="py-5 px-6 align-middle text-[14px] text-[#3a3a3a]">
                      {retailer.email}
                    </td>

                    {/* Date Applied */}
                    <td className="py-5 px-6 align-middle">
                      <div className="text-[14px] text-[#3a3a3a]">
                        {formatDate(retailer.createdAt)}
                      </div>
                      <div className="text-[12px] text-[#627426] font-medium mt-0.5">
                        {formatTime(retailer.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 align-middle text-right lg:text-left">
                      <div className="inline-flex items-center gap-3">
                        <ApproveButton retailerId={retailer.id} />
                        <button
                          type="button"
                          className="p-1.5 text-[#868686] hover:text-black transition-colors rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="size-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm text-[#868686]"
                  >
                    No pending retailers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
