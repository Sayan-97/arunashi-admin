"use client";

import { Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditableFieldProps {
  label: string;
  field: string;
  value: string;
  productId: string;
}

export default function EditableField({
  label,
  field,
  value,
  productId,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(value);

  const save = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: input }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Updated successfully");
        setIsEditing(false);
        // Optionally refresh data; for simplicity we rely on UI state update via next router reload
        // router.refresh();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (_e) {
      toast.error("Network error");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm min-w-[80px]">{label}:</span>
      {isEditing ? (
        <>
          <input
            className="border rounded px-2 py-1 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={save}
            className="text-green-600 hover:text-green-800"
            title="Save"
          >
            <Save size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm">{value}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-800"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
        </>
      )}
    </div>
  );
}
