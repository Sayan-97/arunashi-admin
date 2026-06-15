"use client";

import {
  Activity,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();

  const isSelected = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const isRetailersSelected = isSelected("/retailers");
  const isRequestsSelected = isSelected("/requests");

  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Retailers", href: "/retailers/pending-approvals", icon: Users },
    { label: "Requests", href: "/requests/pending-requests", icon: FileText },
    { label: "Products", href: "/products", icon: Activity },
    { label: "Content", href: "/content", icon: LayoutGrid },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[280px] shrink-0 border-r border-[#EEEEEE] flex flex-col h-screen bg-white select-none">
      {/* Header Logo */}
      <div className="h-[84px] flex items-center justify-center border-b border-[#EEEEEE] px-6 py-4">
        <Image
          src="/app-logo.png"
          alt="Arunashi Logo"
          width={110.84}
          height={48}
          priority
          className="object-contain"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.label === "Retailers"
              ? isRetailersSelected
              : item.label === "Requests"
                ? isRequestsSelected
                : isSelected(item.href);

          return (
            <div key={item.label} className="space-y-1">
              <Link
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-[8px] text-[16px] transition-all duration-150 group ${
                  active
                    ? "bg-[#EEEEE2] text-[#627426] font-semibold"
                    : "text-[#3a3a3a] hover:bg-gray-50 hover:text-black font-normal"
                }`}
              >
                <Icon
                  className={`size-[18px] transition-colors ${
                    active
                      ? "text-[#627426]"
                      : "text-[#3a3a3a] group-hover:text-black"
                  }`}
                />
                <span>{item.label}</span>
              </Link>

              {/* Retailers Submenu */}
              {item.label === "Retailers" && isRetailersSelected && (
                <div className="pl-12.5 pr-4 py-1.5 flex flex-col gap-3">
                  <Link
                    href="/retailers/pending-approvals"
                    className={`text-[14px] transition-colors ${
                      pathname === "/retailers/pending-approvals"
                        ? "text-[#627426] font-semibold"
                        : "text-[#3a3a3a]/80 hover:text-black font-normal"
                    }`}
                  >
                    Pending Approvals
                  </Link>
                  <Link
                    href="/retailers/approved-retailers"
                    className={`text-[14px] transition-colors ${
                      pathname === "/retailers/approved-retailers"
                        ? "text-[#627426] font-semibold"
                        : "text-[#3a3a3a]/80 hover:text-black font-normal"
                    }`}
                  >
                    Approved Retailers
                  </Link>
                </div>
              )}

              {/* Requests Submenu */}
              {item.label === "Requests" && isRequestsSelected && (
                <div className="pl-12.5 pr-4 py-1.5 flex flex-col gap-3">
                  <Link
                    href="/requests/pending-requests"
                    className={`text-[14px] transition-colors ${
                      pathname === "/requests/pending-requests"
                        ? "text-[#627426] font-semibold"
                        : "text-[#3a3a3a]/80 hover:text-black font-normal"
                    }`}
                  >
                    Pending Requests
                  </Link>
                  <Link
                    href="/requests/all-requests"
                    className={`text-[14px] transition-colors ${
                      pathname === "/requests/all-requests"
                        ? "text-[#627426] font-semibold"
                        : "text-[#3a3a3a]/80 hover:text-black font-normal"
                    }`}
                  >
                    All Requests
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Log Out */}
      <button
        type="button"
        onClick={() => logout()}
        className="flex items-center gap-3.5 w-full px-8 py-6 text-[16px] text-[#3a3a3a] hover:bg-gray-50 hover:text-red-600 transition-all select-none cursor-pointer border-t border-[#EEEEEE] font-normal"
      >
        <LogOut className="size-[18px] text-[#3a3a3a] hover:text-red-600" />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
