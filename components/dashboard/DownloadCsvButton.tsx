"use client";

import { Download } from "lucide-react";

interface DownloadCsvButtonProps {
  headers: string[];
  rows: string[][];
  filename: string;
}

export function DownloadCsvButton({
  headers,
  rows,
  filename,
}: DownloadCsvButtonProps) {
  const handleDownload = () => {
    if (!rows || rows.length === 0) return;

    // Build CSV content with RFC 4180 escaping
    const headersStr = headers
      .map((h) => `"${h.replace(/"/g, '""')}"`)
      .join(",");

    const rowsStr = rows.map((row) =>
      row
        .map((val) => {
          const strVal = val || "";
          // Replace newlines and carriage returns to keep rows single-lined
          const sanitizedVal = strVal.replace(/\r?\n|\r/g, " ");
          return `"${sanitizedVal.replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const csvContent = [headersStr, ...rowsStr].join("\n");

    // Add UTF-8 BOM so Excel opens it with correct encoding
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={rows.length === 0}
      className="h-11 px-4 border border-[#E5E5E5] rounded-[8px] bg-white text-sm font-medium text-[#3a3a3a] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-colors shadow-sm select-none"
    >
      <Download className="size-4 text-[#3a3a3a]" />
      <span>Download CSV</span>
    </button>
  );
}

export default DownloadCsvButton;
