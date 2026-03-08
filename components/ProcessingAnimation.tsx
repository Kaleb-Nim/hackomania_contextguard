"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type StepStatus = "pending" | "running" | "done";

export interface TopicsData {
  topics: string[];
  affectedCommunities: string[];
  emotionalTriggers: string[];
}

interface ProcessingAnimationProps {
  stepStatuses: Record<string, StepStatus>;
  sources?: { label: string; url: string }[];
  topicsData?: TopicsData | null;
  onComplete: () => void;
  isWaiting?: boolean;
}

const STEP_DEFINITIONS = [
  { id: "topics", label: "Extracting topics & context" },
  { id: "sources", label: "Retrieving sources" },
  { id: "analyze", label: "Analyzing & generating predictions" },
];

export default function ProcessingAnimation({
  stepStatuses,
  sources = [],
  topicsData = null,
  onComplete,
  isWaiting = false,
}: ProcessingAnimationProps) {
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set());
  const allDone = STEP_DEFINITIONS.every((s) => stepStatuses[s.id] === "done");
  const completeFired = useRef(false);

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    if (allDone && !isWaiting && !completeFired.current) {
      completeFired.current = true;
      const timer = setTimeout(stableOnComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [allDone, isWaiting, stableOnComplete]);

  useEffect(() => {
    if (Object.values(stepStatuses).every((s) => s === "pending")) {
      completeFired.current = false;
      setCollapsedSteps(new Set());
    }
  }, [stepStatuses]);

  const toggleStep = (id: string) => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Show dropdown content: auto-open when data exists, user can toggle to collapse
  const shouldShowDropdown = (id: string): boolean => {
    if (collapsedSteps.has(id)) return false;
    if (id === "topics") return topicsData !== null;
    if (id === "sources") return sources.length > 0;
    return false;
  };

  const hasData = (id: string): boolean => {
    if (id === "topics") return topicsData !== null;
    if (id === "sources") return sources.length > 0;
    return false;
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: 32,
        }}
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-risk-high animate-[pulse_1s_infinite]" />
          <span className="font-mono text-[12px] tracking-[0.06em] text-risk-high">
            ANALYZING
          </span>
        </div>

        {STEP_DEFINITIONS.map((stepDef) => {
          const status = stepStatuses[stepDef.id] ?? "pending";
          const isDone = status === "done";
          const isRunning = status === "running";
          const showDropdown = shouldShowDropdown(stepDef.id);
          const canToggle = hasData(stepDef.id);

          let label = stepDef.label;
          if (stepDef.id === "sources" && sources.length > 0) {
            label = `Retrieving sources (${sources.length} found)`;
          }

          return (
            <div key={stepDef.id}>
              <div
                className="flex items-center gap-3 transition-opacity duration-500"
                style={{
                  padding: "10px 0",
                  opacity: status === "pending" ? 0.2 : 1,
                  cursor: canToggle ? "pointer" : "default",
                }}
                onClick={() => canToggle && toggleStep(stepDef.id)}
              >
                <span className="w-7 text-center text-base">
                  {isDone ? (
                    "\u2713"
                  ) : isRunning ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-risk-high animate-[pulse_1s_infinite]" />
                  ) : (
                    "\u25CB"
                  )}
                </span>
                <span
                  className="text-[13px] transition-colors duration-400"
                  style={{
                    color: isDone
                      ? "rgba(255,255,255,0.6)"
                      : isRunning
                      ? "#e2e4ea"
                      : "rgba(255,255,255,0.25)",
                  }}
                >
                  {label}
                </span>
                {isRunning && !canToggle && (
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    processing...
                  </span>
                )}
                {canToggle && (
                  <span
                    className="ml-auto font-mono text-[10px] text-text-muted transition-transform duration-200"
                    style={{
                      transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    {"\u25BE"}
                  </span>
                )}
              </div>

              {/* Dropdown: Topics */}
              {stepDef.id === "topics" && showDropdown && topicsData && (
                <div
                  style={{
                    marginLeft: 40,
                    paddingBottom: 8,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <div className="mb-2">
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-text-muted">
                      Topics
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {topicsData.topics.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-full px-2.5 py-0.5 text-[11px]"
                          style={{
                            background: "rgba(96,165,250,0.12)",
                            color: "rgba(96,165,250,0.9)",
                            border: "1px solid rgba(96,165,250,0.2)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-text-muted">
                      Affected Communities
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {topicsData.affectedCommunities.map((c, i) => (
                        <span
                          key={i}
                          className="rounded-full px-2.5 py-0.5 text-[11px]"
                          style={{
                            background: "rgba(250,204,21,0.1)",
                            color: "rgba(250,204,21,0.85)",
                            border: "1px solid rgba(250,204,21,0.2)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-text-muted">
                      Emotional Triggers
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {topicsData.emotionalTriggers.map((e, i) => (
                        <span
                          key={i}
                          className="rounded-full px-2.5 py-0.5 text-[11px]"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "rgba(239,68,68,0.85)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdown: Sources — visible live during running + after done */}
              {stepDef.id === "sources" && showDropdown && sources.length > 0 && (
                <div
                  style={{
                    marginLeft: 40,
                    paddingBottom: 8,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  {sources.map((source, i) => (
                    <div
                      key={`${source.url}-${i}`}
                      className="flex items-center gap-2"
                      style={{
                        padding: "3px 0",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <span className="shrink-0 text-[11px] text-blue-400/60">
                        {"\u2192"}
                      </span>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 truncate text-[11px] text-blue-400/70 transition-colors hover:text-blue-400 hover:underline"
                      >
                        {source.label}
                      </a>
                      <span className="ml-auto shrink-0 font-mono text-[9px] text-text-muted/40">
                        {new URL(source.url).hostname}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Finalizing indicator when all steps done but waiting for API */}
        {allDone && isWaiting && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: 16,
              paddingTop: 16,
              animation: "fadeIn 0.4s ease",
            }}
            className="flex items-center gap-2.5"
          >
            <div className="h-2 w-2 rounded-full bg-accent-green animate-[pulse_1s_infinite]" />
            <span className="font-mono text-[12px] tracking-[0.06em] text-accent-green">
              Finalizing results...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
