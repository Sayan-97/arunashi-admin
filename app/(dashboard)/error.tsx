"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full py-32 text-center select-none">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        This page couldn&apos;t load. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-10 px-5 bg-[#627426] hover:bg-[#627426]/90 text-white font-semibold rounded-[6px] text-sm cursor-pointer transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
