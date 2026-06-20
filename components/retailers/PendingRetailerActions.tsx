"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ViewRetailerButton } from "./ViewRetailerButton";

interface Retailer {
  id: string;
  name: string;
  phone: string;
  company: string;
  email: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: string | null;
  pressTitle?: string | null;
  press_title?: string | null;
  createdAt: string;
}

interface PendingRetailerActionsProps {
  retailer: Retailer;
}

export function PendingRetailerActions({
  retailer,
}: PendingRetailerActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateCoords = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.right - 144 + window.scrollX, // 144px is width of w-36 dropdown
        });
      }
    };

    if (isMenuOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isMenuOpen]);

  // Adapt the pending retailer object to match the Retailer type expected by ViewRetailerButton
  const adaptedRetailer = {
    ...retailer,
    company: retailer.company || null,
    phone: retailer.phone || null,
    address: retailer.address || null,
    press_title: retailer.press_title || retailer.pressTitle || null,
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1.5 text-[#868686] hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
      >
        <MoreVertical className="size-[18px]" />
      </button>

      {/* Render the details dialog outside of the dropdown lifecycle */}
      <ViewRetailerButton
        retailer={adaptedRetailer}
        showApproveButton={true}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        trigger={null}
      />

      {isMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-[9998] cursor-default"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: "144px", // w-36
              }}
              className="bg-white border border-[#EEEEEE] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1.5 z-[9999] flex flex-col text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDialogOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#3a3a3a] hover:bg-[#FAF9F6] transition-colors cursor-pointer font-medium"
              >
                View
              </button>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export default PendingRetailerActions;
