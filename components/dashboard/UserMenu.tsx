"use client";

import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/actions/auth";

interface UserMenuProps {
  name: string;
  email: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full border border-[#EEEEEE] bg-[#FAF9F6] text-[#3a3a3a] hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-colors shadow-sm select-none"
      >
        <User className="size-5 text-[#3a3a3a]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white border border-[#EEEEEE] rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 z-50 flex flex-col">
          <div className="px-4 py-2 border-b border-[#EEEEEE]">
            <p className="font-semibold text-sm text-[#111111] truncate">
              {name}
            </p>
            <p className="text-xs text-[#868686] truncate mt-0.5">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-[#3a3a3a] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
