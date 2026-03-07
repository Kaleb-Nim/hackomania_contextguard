"use client";

import { type Language } from "@/data/demo-scenario";
import CopyButton from "./CopyButton";
import LanguageToggle from "./LanguageToggle";

interface CounterNarrativeDisplayProps {
  counterNarratives: Record<Language, string>;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function CounterNarrativeDisplay({
  counterNarratives,
  selectedLanguage,
  onLanguageChange,
}: CounterNarrativeDisplayProps) {
  const text = counterNarratives[selectedLanguage];

  return (
    <div
      style={{
        background: "rgba(34,197,94,0.05)",
        border: "1px solid rgba(34,197,94,0.12)",
        borderRadius: 8,
        padding: "16px 18px",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-accent-green">
          Ready-to-Deploy Counter-Narrative
        </span>
        <LanguageToggle
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>
      <p
        className="m-0 text-[13px] leading-[1.75] tracking-[0.01em]"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {text}
      </p>
      <div className="mt-3">
        <CopyButton text={text} />
      </div>
    </div>
  );
}
