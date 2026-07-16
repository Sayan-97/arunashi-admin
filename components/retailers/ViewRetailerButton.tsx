"use client";

import { useState } from "react";
import { toast } from "sonner";
import { approveRetailer } from "@/actions/retailers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResendActivationButton } from "./ResendActivationButton";

interface Retailer {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: string | null;
  press_title?: string | null;
  pressTitle?: string | null;
  createdAt: string;
  status?: string | null;
}

interface ViewRetailerButtonProps {
  retailer: Retailer;
  showApproveButton?: boolean;
  trigger?: React.ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ViewRetailerButton({
  retailer,
  showApproveButton = false,
  trigger,
  open,
  onOpenChange,
}: ViewRetailerButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await approveRetailer(retailer.id);
      if (res.error) {
        toast.error(res.error, {
          position: "top-right",
        });
      } else {
        toast.success("Retailer approved successfully!", {
          position: "top-right",
        });
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred", {
        position: "top-right",
      });
    } finally {
      setIsApproving(false);
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <button
              type="button"
              className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              View
            </button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-2xl bg-white border border-[#EEEEEE] rounded-[10px] p-6 max-h-[90vh] flex flex-col gap-5 overflow-hidden shadow-xl"
      >
        <DialogHeader className="pb-4 flex flex-col gap-1.5 text-left border-b border-[#EEEEEE]">
          <DialogTitle className="text-xl font-medium text-[#111111] font-sans">
            Retailer Details
          </DialogTitle>
          <DialogDescription className="text-xs text-[#868686] font-mono uppercase tracking-wider">
            {showApproveButton ? "Applied on" : "Approved on"}{" "}
            {formatDate(retailer.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 scrollbar-thin">
          <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <div>
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Business / Company
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px]">
                  {retailer.company || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Contact Person
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px]">
                  {retailer.name}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Email Address
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px] break-all">
                  {retailer.email}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Phone Number
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px]">
                  {retailer.phone || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Press / Job Title
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px]">
                  {retailer.press_title || retailer.pressTitle || "N/A"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[#868686] text-xs uppercase tracking-wider font-semibold block">
                  Business Address
                </span>
                <span className="font-semibold text-[#111111] block mt-1 text-[15px] whitespace-pre-wrap leading-relaxed">
                  {retailer.address || "N/A"}
                </span>
                {(retailer.city ||
                  retailer.state ||
                  retailer.country ||
                  retailer.zipcode) && (
                  <span className="text-xs text-[#555555] block mt-1 font-medium">
                    {[
                      retailer.city,
                      retailer.state,
                      retailer.zipcode,
                      retailer.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#EEEEEE] pt-4 flex items-center justify-end gap-3 select-none">
          {showApproveButton &&
            (retailer.status === "PENDING" ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="h-10 px-5 rounded-[6px] bg-[#627426] text-white hover:bg-[#627426]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold cursor-pointer"
              >
                {isApproving ? "Approving..." : "Approve Retailer"}
              </button>
            ) : (
              <ResendActivationButton
                retailerId={retailer.id}
                className="h-10 px-5 text-sm min-w-[120px]"
              />
            ))}
          <DialogClose asChild>
            <button
              type="button"
              className="h-10 px-5 rounded-[6px] border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 transition-all text-sm font-semibold cursor-pointer"
            >
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
