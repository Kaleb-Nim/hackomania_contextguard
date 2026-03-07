"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import RumourCard from "@/components/RumourCard";
import ActionPanel from "@/components/ActionPanel";
import SummaryStats from "@/components/SummaryStats";
import PatternBar from "@/components/PatternBar";
import Navbar from "@/components/Navbar";
import {
  DEMO_SCENARIO,
  DEMO_SOURCES,
  type RumourPrediction,
  type HistoricalPattern,
} from "@/data/demo-scenario";
import type { AnalyzeResponse } from "@/lib/types";

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

  // Dynamic state from API
  const [predictions, setPredictions] = useState<RumourPrediction[]>(
    DEMO_SCENARIO.predictions
  );
  const [historicalPatterns, setHistoricalPatterns] = useState<
    HistoricalPattern[]
  >(DEMO_SCENARIO.historicalPatterns);
  const [communityLeadersCount, setCommunityLeadersCount] = useState(
    DEMO_SCENARIO.communityLeadersCount
  );
  const [constituencies, setConstituencies] = useState(
    DEMO_SCENARIO.constituencies
  );
  const [displaySources, setDisplaySources] = useState<{ label: string; url: string }[]>([]);

  // Refs for syncing API response with animation
  const apiResultRef = useRef<AnalyzeResponse | null>(null);
  const animationDoneRef = useRef(false);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);

  const applyResults = useCallback((data: AnalyzeResponse) => {
    setPredictions(data.predictions);
    setHistoricalPatterns(data.historicalPatterns);
    setCommunityLeadersCount(data.communityLeadersCount);
    setConstituencies(data.constituencies);
    if (data.sources && data.sources.length > 0) {
      setDisplaySources(data.sources);
    }
  }, []);

  const showResults = useCallback(
    (data: AnalyzeResponse) => {
      applyResults(data);
      setIsWaitingForApi(false);
      setStep("results");
      let r = 0;
      const interval = setInterval(() => {
        r++;
        setVisibleRumours(r);
        if (r >= data.predictions.length) clearInterval(interval);
      }, 350);
    },
    [applyResults]
  );

  const handleAnalyse = useCallback(() => {
    setStep("analyzing");
    setDisplaySources([]);
    apiResultRef.current = null;
    animationDoneRef.current = false;
    setIsWaitingForApi(false);

    // SSE stream for real-time source updates
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: announcementText }),
    })
      .then(async (res) => {
        if (!res.body) throw new Error("No stream body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "source") {
                setDisplaySources((prev) => [...prev, { label: data.label, url: data.url }]);
              } else if (currentEvent === "result") {
                const result = data as AnalyzeResponse;
                if (animationDoneRef.current) {
                  showResults(result);
                } else {
                  apiResultRef.current = result;
                }
              }
            }
          }
        }
      })
      .catch(() => {
        const fallback: AnalyzeResponse = {
          predictions: DEMO_SCENARIO.predictions,
          historicalPatterns: DEMO_SCENARIO.historicalPatterns,
          communityLeadersCount: DEMO_SCENARIO.communityLeadersCount,
          constituencies: DEMO_SCENARIO.constituencies,
          sources: DEMO_SOURCES,
          fallback: true,
        };
        if (animationDoneRef.current) {
          showResults(fallback);
        } else {
          apiResultRef.current = fallback;
        }
      });
  }, [announcementText, showResults]);

  const handleProcessingComplete = useCallback(() => {
    animationDoneRef.current = true;
    if (apiResultRef.current) {
      // API already finished — show results immediately
      showResults(apiResultRef.current);
    } else {
      // API still running — show "Finalizing..." state
      setIsWaitingForApi(true);
    }
  }, [showResults]);

  const handleReset = () => {
    setStep("input");
    setExpandedRumour(null);
    setVisibleRumours(0);
    setPredictions(DEMO_SCENARIO.predictions);
    setHistoricalPatterns(DEMO_SCENARIO.historicalPatterns);
    setCommunityLeadersCount(DEMO_SCENARIO.communityLeadersCount);
    setConstituencies(DEMO_SCENARIO.constituencies);
    setDisplaySources([]);
    apiResultRef.current = null;
    animationDoneRef.current = false;
    setIsWaitingForApi(false);
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
            sources={displaySources}
            onComplete={handleProcessingComplete}
            isWaiting={isWaitingForApi}
          />
        )}

        {/* Results phase */}
        {step === "results" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Summary stats */}
            <div className="mb-7">
              <SummaryStats
                predictionsCount={predictions.length}
                highestRiskScore={
                  predictions.length > 0
                    ? Math.max(...predictions.map((p) => p.riskScore))
                    : 0
                }
                highestRiskSub={
                  predictions.length > 0
                    ? predictions.reduce((a, b) =>
                        a.riskScore > b.riskScore ? a : b
                      ).trigger
                    : ""
                }
              />
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
              {historicalPatterns.map((p, i) => (
                <div
                  key={i}
                  className={
                    i < historicalPatterns.length - 1 ? "mb-2.5" : ""
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
              {predictions.map((prediction, i) => (
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
                communityLeadersCount={communityLeadersCount}
                constituencies={constituencies}
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
