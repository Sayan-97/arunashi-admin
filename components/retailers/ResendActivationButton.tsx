"use client";

import { useState } from "react";
import { toast } from "sonner";
import { resendActivationEmail } from "@/actions/retailers";

interface ResendActivationButtonProps {
  retailerId: string;
}

export function ResendActivationButton({
  retailerId,
}: ResendActivationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await resendActivationEmail(retailerId);
      if (res.error) {
        toast.error(res.error, {
          position: "top-right",
        });
      } else {
        toast.success("Activation email resent successfully!", {
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
      onClick={handleResend}
      disabled={loading}
      className="h-8 px-4 rounded-[6px] border border-[#a2a657] text-[#627426] hover:bg-[#627426] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold cursor-pointer flex items-center justify-center min-w-[100px]"
    >
      {loading ? "Sending..." : "Resend Link"}
    </button>
  );
}
