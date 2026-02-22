"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PreviewBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-red-800 text-white text-center text-sm font-medium py-2 px-4 z-[9999] relative flex items-center justify-center">
      <span>
        ⚠️ Preview Version — You have been granted admin privileges and can
        access the entire project.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}
