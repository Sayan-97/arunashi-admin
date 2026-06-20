"use client";

import { ChevronLeft, ChevronRight, KeyRound, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/actions/settings";
import type { AuditLog } from "@/services/settings";

interface SettingsClientProps {
  initialLogs: AuditLog[];
  profile: {
    name: string;
    email: string;
  };
}

export default function SettingsClient({
  initialLogs,
  profile,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"security" | "audit">("security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state for logs
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(initialLogs.length / itemsPerPage) || 1;
  const paginatedLogs = initialLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Refresh router to fetch updated audit logs
        router.refresh();
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date format helper
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${formattedDate} at ${formattedTime}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs Selector */}
      <div className="flex border-b border-[#EEEEEE] gap-8 select-none">
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`pb-4 text-[16px] transition-all relative font-sans cursor-pointer ${
            activeTab === "security"
              ? "text-[#627426] font-semibold"
              : "text-[#868686] hover:text-[#3a3a3a] font-normal"
          }`}
        >
          <span>Profile & Security</span>
          {activeTab === "security" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#627426] rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`pb-4 text-[16px] transition-all relative font-sans cursor-pointer ${
            activeTab === "audit"
              ? "text-[#627426] font-semibold"
              : "text-[#868686] hover:text-[#3a3a3a] font-normal"
          }`}
        >
          <span>System Audit Logs</span>
          {activeTab === "audit" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#627426] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === "security" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Profile Section */}
            <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm p-8 space-y-6 flex flex-col justify-between w-full">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#627426]">
                    <div className="size-5 rounded-full border border-[#627426] flex items-center justify-center font-bold text-[10px] uppercase">
                      {profile.name ? profile.name[0] : "A"}
                    </div>
                    <h2 className="text-lg font-semibold text-[#111111] font-sans">
                      Administrator Profile
                    </h2>
                  </div>
                  <p className="text-sm text-[#868686] leading-relaxed">
                    View your current account credentials and status.
                  </p>
                </div>

                <div className="border-t border-[#EEEEEE] pt-6 space-y-5">
                  <div>
                    <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                      Name
                    </span>
                    <span className="font-semibold text-[#111111] block mt-1 text-[15px]">
                      {profile.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                      Email Address
                    </span>
                    <span className="font-semibold text-[#111111] block mt-1 text-[15px] break-all">
                      {profile.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                      Account Status
                    </span>
                    <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm p-8 space-y-6 w-full">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#627426]">
                  <KeyRound className="size-5" />
                  <h2 className="text-lg font-semibold text-[#111111] font-sans">
                    Security & Credentials
                  </h2>
                </div>
                <p className="text-sm text-[#868686] leading-relaxed">
                  Update your administrator password regularly to maintain
                  dashboard security.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3a3a3a] uppercase tracking-wider">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686]/60 focus:outline-none focus:border-[#627426]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3a3a3a] uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686]/60 focus:outline-none focus:border-[#627426]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3a3a3a] uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-sm text-black placeholder:text-[#868686]/60 focus:outline-none focus:border-[#627426]/50 transition-colors disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#627426] hover:bg-[#52631f] text-white rounded-[8px] font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Audit Logs Panel */
          <div className="bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm flex flex-col h-auto min-h-[520px] w-full">
            {/* Header */}
            <div className="p-6 border-b border-[#EEEEEE] space-y-1.5">
              <div className="flex items-center gap-2 text-[#627426]">
                <ShieldAlert className="size-5" />
                <h2 className="text-lg font-semibold text-[#111111] font-sans">
                  System Audit Logs
                </h2>
              </div>
              <p className="text-sm text-[#868686]">
                Recent administrative operations recorded in the system.
              </p>
            </div>

            {/* Table/List */}
            <div className="flex-1 overflow-y-auto">
              {paginatedLogs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEEE] bg-gray-50/50 sticky top-0 z-10">
                      <th className="py-3 px-6 text-[11px] font-semibold text-[#868686] uppercase tracking-wider">
                        Administrative Action
                      </th>
                      <th className="py-3 px-6 text-[11px] font-semibold text-[#868686] uppercase tracking-wider w-[240px]">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-[#EEEEEE] last:border-b-0 hover:bg-gray-50/20 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-[#3a3a3a] font-normal leading-relaxed">
                          {log.action}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#868686] whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-[#868686]/70 space-y-1">
                  <p className="text-sm font-medium">
                    No actions recorded yet.
                  </p>
                  <p className="text-xs">
                    Any admin actions will appear here automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Pagination */}
            {totalPages > 1 && (
              <div className="p-4.5 border-t border-[#EEEEEE] bg-white flex items-center justify-between select-none">
                <span className="text-xs text-[#868686]">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
