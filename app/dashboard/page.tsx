"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import RumourCard from "@/components/RumourCard";
import ActionPanel from "@/components/ActionPanel";
import SummaryStats from "@/components/SummaryStats";
import PatternBar from "@/components/PatternBar";
import Navbar from "@/components/Navbar";
import { DEMO_SCENARIO } from "@/data/demo-scenario";

const AnnouncementInput = dynamic(
  () => import("@/components/AnnouncementInput"),
  { ssr: false }
);

type Step = "input" | "analyzing" | "results";

export default function DashboardPage() {
  const [step, setStep] = useState<Step>("input");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expandedRumour, setExpandedRumour] = useState<number | null>(null);
  const [visibleRumours, setVisibleRumours] = useState(0);
  const [announcementText, setAnnouncementText] = useState(
    DEMO_SCENARIO.announcementText
  );
  const [inputMode, setInputMode] = useState<"text" | "pdf">("text");

  const handleAnalyse = useCallback(() => {
    setStep("analyzing");
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setStep("results");
    let r = 0;
    const interval = setInterval(() => {
      r++;
      setVisibleRumours(r);
      if (r >= DEMO_SCENARIO.predictions.length) clearInterval(interval);
    }, 350);
  }, []);

  const handleReset = () => {
    setStep("input");
    setExpandedRumour(null);
    setVisibleRumours(0);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[960px] px-5 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-1.5 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-tertiary">
              System Active
            </span>
          </div>
          <h1
            className="mb-1 text-[36px] font-black tracking-tight"
            style={{
              background:
                "linear-gradient(135deg, #e2e4ea 0%, #8b8fa3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ContextGuard
          </h1>
          <p className="text-[14px] tracking-[0.02em] text-text-tertiary">
            Rumour Pre-Mortem Engine &mdash; Singapore
          </p>
        </div>

        {/* Input phase */}
        {step === "input" && (
          <AnnouncementInput
            file={uploadedFile}
            onFileUpload={setUploadedFile}
            onAnalyse={handleAnalyse}
            announcementText={announcementText}
            onTextChange={setAnnouncementText}
            mode={inputMode}
            onModeChange={setInputMode}
          />
        )}

        {/* Analyzing phase */}
        {step === "analyzing" && (
          <ProcessingAnimation
            steps={DEMO_SCENARIO.analyzeSteps}
            onComplete={handleProcessingComplete}
          />
        )}

        {/* Results phase */}
        {step === "results" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Summary stats */}
            <div className="mb-7">
              <SummaryStats />
            </div>

            {/* Historical patterns */}
            <div
              className="mb-7"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "18px 20px",
              }}
            >
              <div className="mb-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-text-tertiary">
                &#129504; Corpus Pattern Matches
              </div>
              {DEMO_SCENARIO.historicalPatterns.map((p, i) => (
                <div
                  key={i}
                  className={
                    i < DEMO_SCENARIO.historicalPatterns.length - 1
                      ? "mb-2.5"
                      : ""
                  }
                >
                  <div className="mb-1 text-[12px] text-text-secondary">
                    {p.event}
                  </div>
                  <PatternBar similarity={p.similarity} />
                </div>
              ))}
            </div>

            {/* Predicted rumours */}
            <div className="mb-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-text-tertiary">
              Predicted False Narratives
            </div>

            <div className="space-y-3">
              {DEMO_SCENARIO.predictions.map((prediction, i) => (
                <div
                  key={prediction.id}
                  style={{
                    opacity: i < visibleRumours ? 1 : 0,
                    transform:
                      i < visibleRumours
                        ? "translateY(0)"
                        : "translateY(16px)",
                    transition:
                      "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  <RumourCard
                    prediction={prediction}
                    isExpanded={expandedRumour === prediction.id}
                    onToggle={() =>
                      setExpandedRumour(
                        expandedRumour === prediction.id
                          ? null
                          : prediction.id
                      )
                    }
                  />
                </div>
              ))}
            </div>

            {/* Deploy panel */}
            <div className="mt-7">
              <ActionPanel
                communityLeadersCount={DEMO_SCENARIO.communityLeadersCount}
                constituencies={DEMO_SCENARIO.constituencies}
              />
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="mt-4 cursor-pointer font-mono text-[11px] tracking-[0.04em] text-text-muted transition-colors hover:text-text-secondary"
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
              }}
            >
              &larr; New Analysis
            </button>
          </div>
        )}
      </div>
    </>
  );
}
