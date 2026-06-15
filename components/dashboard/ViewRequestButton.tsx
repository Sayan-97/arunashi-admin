"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateRequestStatus } from "@/actions/requests";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface ViewRequestButtonProps {
  request: ProductRequest;
  defaultOpen?: boolean;
}

export function ViewRequestButton({
  request,
  defaultOpen = false,
}: ViewRequestButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);

  const openParam = searchParams.get("open");
  const isTargetOfOpen = openParam === request.id;

  useEffect(() => {
    if (isTargetOfOpen) {
      setIsOpen(true);
    }
  }, [isTargetOfOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      if (params.has("open")) {
        params.delete("open");
        const query = params.toString() ? `?${params.toString()}` : "";
        router.replace(pathname + query, { scroll: false });
      }
    }
  };

  const handleStatusUpdate = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      const res = await updateRequestStatus(request.id, status);
      if (res.error) {
        toast.error(res.error, {
          position: "top-right",
        });
      } else {
        toast.success(`Request ${status.toLowerCase()} successfully!`, {
          position: "top-right",
        });
        handleOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRequestId = (uuid: string) => {
    return `REQ-${uuid.split("-")[0].substring(0, 4).toUpperCase()}`;
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

  const items = Array.isArray(request.items) ? request.items : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          View
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-2xl bg-white border border-[#EEEEEE] rounded-[10px] p-6 max-h-[90vh] flex flex-col gap-5 overflow-hidden shadow-xl"
      >
        <DialogHeader className="pb-4 flex flex-col gap-1.5 text-left">
          <DialogTitle className="text-xl font-medium text-[#111111] font-sans">
            Request Details
          </DialogTitle>
          <DialogDescription className="text-xs text-[#868686] font-mono uppercase tracking-wider">
            {formatRequestId(request.id)} • Submitted on{" "}
            {formatDate(request.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 scrollbar-thin">
          {/* Retailer Info section */}
          <div className="bg-[#FAF9F6]/60 border border-[#EEEEEE] rounded-[8px] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans">
              Retailer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-[#868686] text-xs block">
                  Business / Company
                </span>
                <span className="font-semibold text-[#111111] block mt-0.5">
                  {request.user.company || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#868686] text-xs block">
                  Contact Person
                </span>
                <span className="font-semibold text-[#111111] block mt-0.5">
                  {request.user.name}
                </span>
              </div>
              <div className="md:col-span-2 mt-1">
                <span className="text-[#868686] text-xs block">
                  Email Address
                </span>
                <span className="font-semibold text-[#111111] block mt-0.5">
                  {request.user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Requested Products section */}
          <div className="space-y-4.5">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#627426] font-sans">
                Requested Products ({items.length})
              </h3>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  request.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : request.status === "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-[#fff4cc] text-gray-800"
                }`}
              >
                {request.status}
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item: any, idx: number) => (
                <div
                  key={`${item.id || idx}`}
                  className="flex gap-4 p-3 border border-[#EEEEEE] rounded-[8px] hover:bg-gray-50/50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="size-20 shrink-0 bg-[#FAF9F6] border border-[#EEEEEE] rounded-[6px] overflow-hidden flex items-center justify-center p-1.5">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] text-[#868686] text-center font-medium font-sans">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-[15px] text-[#111111] leading-snug truncate">
                          {item.name}
                        </h4>
                        <span className="font-semibold text-sm text-[#3a3a3a] shrink-0 font-mono">
                          {item.msrp}
                        </span>
                      </div>
                      <p className="text-xs text-[#868686] mt-0.5 font-normal">
                        Item No: {item.itemNo || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs font-semibold ${
                          item.stockStatus === "In Stock"
                            ? "text-[#487E3E]"
                            : "text-red-500"
                        }`}
                      >
                        {item.stockStatus || "Out of Stock"}
                      </span>
                    </div>

                    {/* Custom Notes */}
                    {item.notes && item.notes.trim().length > 0 && (
                      <div className="bg-[#FAF9F6] border-l-2 border-[#bec36c] p-2.5 rounded-r-[4px] mt-2 text-xs text-[#3a3a3a] italic leading-relaxed whitespace-pre-wrap break-words">
                        <span className="font-bold text-[#627426] not-italic block mb-0.5">
                          Notes / Quote request:
                        </span>
                        "{item.notes.trim()}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#EEEEEE] pt-4 flex items-center justify-between gap-3 select-none">
          <DialogClose asChild>
            <button
              type="button"
              className="h-10 px-5 rounded-[6px] border border-[#E5E5E5] text-[#3a3a3a] hover:bg-gray-50 transition-all text-sm font-semibold cursor-pointer"
            >
              Close
            </button>
          </DialogClose>

          {request.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusUpdate("REJECTED")}
                disabled={loading}
                className="h-10 px-5 rounded-[6px] bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer"
              >
                {loading ? "Processing..." : "Reject"}
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate("APPROVED")}
                disabled={loading}
                className="h-10 px-5 rounded-[6px] bg-[#627426] hover:bg-[#627426]/90 disabled:opacity-50 text-white transition-all text-sm font-semibold cursor-pointer"
              >
                {loading ? "Processing..." : "Approve"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
