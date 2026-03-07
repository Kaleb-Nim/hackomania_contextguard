"use client";

import { useState, useEffect } from "react";
import type { AnalyzeStep } from "@/data/demo-scenario";

interface ProcessingAnimationProps {
  steps: AnalyzeStep[];
  sources?: { label: string; url: string }[];
  onComplete: () => void;
  isWaiting?: boolean;
}

export default function ProcessingAnimation({
  steps,
  sources = [],
  onComplete,
  isWaiting = false,
}: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSources, setVisibleSources] = useState(0);
  const stepsFinished = currentStep >= steps.length;
  const sourcesActive = currentStep >= 3;
  const sourcesFinished = visibleSources >= sources.length;

  // Step timer
  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  // Source streaming timer — starts when step 4 (index 3) becomes active
  useEffect(() => {
    if (!sourcesActive || sources.length === 0) return;
    if (visibleSources >= sources.length) return;

    const timer = setTimeout(() => {
      setVisibleSources((s) => s + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [sourcesActive, visibleSources, sources.length]);

  // Fire onComplete only when both steps and sources are done AND not waiting for API
  useEffect(() => {
    if (stepsFinished && sourcesFinished && !isWaiting) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [stepsFinished, sourcesFinished, isWaiting, onComplete]);

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
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 transition-opacity duration-500"
            style={{
              padding: "10px 0",
              opacity: i <= currentStep ? 1 : 0.2,
            }}
          >
            <span className="w-7 text-center text-base">
              {i < currentStep ? "\u2713" : step.icon}
            </span>
            <span
              className="text-[13px] transition-colors duration-400"
              style={{
                color:
                  i < currentStep
                    ? "rgba(255,255,255,0.6)"
                    : i === currentStep
                    ? "#e2e4ea"
                    : "rgba(255,255,255,0.25)",
              }}
            >
              {step.label}
            </span>
            {i === currentStep && (
              <span className="ml-auto font-mono text-[10px] text-text-muted">
                processing...
              </span>
            )}
          </div>
        ))}

        {/* Source retrieval feed */}
        {sourcesActive && sources.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: 16,
              paddingTop: 16,
              animation: "fadeIn 0.4s ease",
            }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-[pulse_1s_infinite]" />
              <span className="font-mono text-[12px] tracking-[0.06em] text-blue-400">
                RETRIEVING SOURCES
              </span>
            </div>
            {sources.map((source, i) => (
              <div
                key={i}
                className="flex items-center gap-2 transition-opacity duration-500"
                style={{
                  padding: "5px 0",
                  opacity: i < visibleSources ? 1 : i === visibleSources && sourcesActive ? 0.4 : 0,
                }}
              >
                <span className="w-5 text-center text-[12px] text-blue-400/70">
                  {i < visibleSources ? "\u2713" : "\u21B3"}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] transition-colors hover:underline"
                  style={{
                    color: i < visibleSources ? "rgba(96,165,250,0.7)" : "rgba(96,165,250,0.4)",
                  }}
                >
                  {source.label}
                </a>
                {i === visibleSources && !sourcesFinished && (
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    fetching...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Finalizing indicator when animation done but waiting for API */}
        {stepsFinished && sourcesFinished && isWaiting && (
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
