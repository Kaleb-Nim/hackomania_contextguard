"use client";

import { useState } from "react";
import { type RumourPrediction, type Language } from "@/data/demo-scenario";
import RiskBadge from "./RiskBadge";
import CounterNarrativeDisplay from "./CounterNarrativeDisplay";

interface RumourCardProps {
  prediction: RumourPrediction;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function RumourCard({
  prediction,
  isExpanded,
  onToggle,
}: RumourCardProps) {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div
      style={{
        background: isExpanded
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${isExpanded ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-start gap-3.5"
        style={{ padding: "16px 20px" }}
      >
        <div className="min-w-[28px] pt-0.5 text-center text-base opacity-60">
          {isExpanded ? "\u25BE" : "\u25B8"}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <RiskBadge risk={prediction.risk} score={prediction.riskScore} />
            <span className="font-mono text-[10px] text-text-muted">
              est. spread: {prediction.timeToSpread}
            </span>
          </div>
          <h3 className="m-0 text-[15px] font-bold leading-[1.4] text-text-primary">
            &ldquo;{prediction.title}&rdquo;
          </h3>
          <div className="mt-2 flex flex-wrap gap-4">
            <span className="text-[12px] text-text-tertiary">
              <span className="text-text-secondary">Channel:</span>{" "}
              {prediction.channel}
            </span>
            <span className="text-[12px] text-text-tertiary">
              <span className="text-text-secondary">Trigger:</span>{" "}
              {prediction.trigger}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div
          style={{ padding: "0 20px 20px 62px", animation: "fadeIn 0.3s ease" }}
        >
          {/* Historical match */}
          <div
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.12)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <div className="mb-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-risk-high">
              Historical Pattern Match
            </div>
            <p className="m-0 text-[12px] leading-[1.6] text-text-secondary">
              {prediction.historicalMatch}
            </p>
          </div>

          {/* Demographic risk */}
          <div className="mb-4 text-[12px] text-text-tertiary">
            <span className="font-semibold text-text-secondary">
              Primary demographic risk:
            </span>{" "}
            {prediction.demographicRisk}
          </div>

          {/* Counter-narrative */}
          <CounterNarrativeDisplay
            counterNarratives={prediction.counterNarratives}
            selectedLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>
      )}
    </div>
  );
}
