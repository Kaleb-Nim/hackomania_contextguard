"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({
  text,
  label = "Copy to clipboard",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-[11px] font-bold tracking-[0.04em] transition-all cursor-pointer"
      style={{
        padding: "8px 16px",
        background: copied
          ? "rgba(34,197,94,0.2)"
          : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 6,
        color: copied ? "#22c55e" : "rgba(255,255,255,0.5)",
      }}
    >
      {copied ? "\u2713 Copied" : label}
    </button>
  );
}
