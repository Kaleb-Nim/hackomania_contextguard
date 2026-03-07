"use client";

import { useState } from "react";
import { type RumourPrediction, type Language } from "@/data/demo-scenario";
import RiskBadge from "./RiskBadge";
import CounterNarrativeDisplay from "./CounterNarrativeDisplay";
import CopyButton from "./CopyButton";

interface CommunityAlertCardProps {
  prediction: RumourPrediction;
  receivedTime: string;
  topic: string;
}

export default function CommunityAlertCard({
  prediction,
  receivedTime,
  topic,
}: CommunityAlertCardProps) {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        padding: "20px 22px",
      }}
    >
      <div className="mb-3 flex items-start justify-between">
        <RiskBadge risk={prediction.risk} score={prediction.riskScore} />
        <span className="font-mono text-[11px] text-text-muted">
          {receivedTime}
        </span>
      </div>

      <p className="mb-1 text-[11px] text-text-muted">Topic: {topic}</p>

      <div className="mb-4">
        <p className="mb-1 text-[12px] font-semibold text-text-tertiary">
          False claim likely to spread:
        </p>
        <p className="text-[14px] font-semibold italic text-text-primary">
          &ldquo;{prediction.title}&rdquo;
        </p>
      </div>

      <CounterNarrativeDisplay
        counterNarratives={prediction.counterNarratives}
        selectedLanguage={language}
        onLanguageChange={setLanguage}
      />

      <div className="mt-4 flex gap-3">
        <CopyButton
          text={prediction.counterNarratives[language]}
          label="Copy Message"
        />
        <a
          href={`https://wa.me/?text=${encodeURIComponent(prediction.counterNarratives[language])}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 cursor-pointer font-mono text-[11px] font-bold tracking-[0.04em] text-white no-underline transition-all hover:brightness-110"
          style={{
            padding: "8px 16px",
            background: "#25D366",
            border: "none",
            borderRadius: 6,
          }}
        >
          Share via WhatsApp
        </a>
      </div>
    </div>
  );
}
