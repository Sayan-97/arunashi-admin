import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-[#627426]" />
    </div>
  );
}
