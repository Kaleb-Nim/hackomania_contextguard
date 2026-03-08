"use client";

import { useState } from "react";

interface AnalyzedArticleProps {
  text: string;
}

export default function AnalyzedArticle({ text }: AnalyzedArticleProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 400;
  const displayText = expanded || !isLong ? text : text.slice(0, 400) + "…";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        padding: "16px 18px",
        height: "100%",
      }}
    >
      <div className="mb-3 text-[11px] tracking-[0.06em] uppercase text-text-tertiary">
        Analyzed Article
      </div>
      <div
        className="text-[12px] leading-[1.7] text-text-secondary whitespace-pre-wrap"
        style={{
          maxHeight: expanded ? "none" : 120,
          overflow: "hidden",
          maskImage: !expanded && isLong
            ? "linear-gradient(to bottom, black 60%, transparent 100%)"
            : "none",
          WebkitMaskImage: !expanded && isLong
            ? "linear-gradient(to bottom, black 60%, transparent 100%)"
            : "none",
        }}
      >
        {displayText}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 cursor-pointer font-mono text-[10px] tracking-[0.04em] text-text-muted transition-colors hover:text-text-secondary"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
