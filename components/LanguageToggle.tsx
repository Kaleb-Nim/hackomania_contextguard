"use client";

import {
  type Language,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
} from "@/data/demo-scenario";

interface LanguageToggleProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: Language[] = ["en", "zh", "ms", "ta"];

export default function LanguageToggle({
  selectedLanguage,
  onLanguageChange,
}: LanguageToggleProps) {
  return (
    <div className="flex gap-1">
      {languages.map((lang) => {
        const isActive = selectedLanguage === lang;
        return (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className="cursor-pointer text-[11px] font-semibold transition-all"
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              border: isActive
                ? "1px solid rgba(34,197,94,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: isActive
                ? "rgba(34,197,94,0.15)"
                : "transparent",
              color: isActive ? "#22c55e" : "rgba(255,255,255,0.35)",
            }}
          >
            {LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
