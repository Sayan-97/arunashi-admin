"use client";

import { useState } from "react";
import { toast } from "sonner";
import { approveRetailer } from "@/actions/retailers";

interface ApproveButtonProps {
  retailerId: string;
}

export function ApproveButton({ retailerId }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await approveRetailer(retailerId);
      if (res.error) {
        toast.error(res.error, {
          position: "top-right",
        });
      } else {
        toast.success("Retailer approved successfully!", {
          position: "top-right",
        });
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

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={loading}
      className="h-8 px-4 rounded-[6px] border border-[#bec36c] text-[#627426] hover:bg-[#627426] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold cursor-pointer flex items-center justify-center min-w-[80px]"
    >
      {loading ? "Approving..." : "Approve"}
    </button>
  );
}
