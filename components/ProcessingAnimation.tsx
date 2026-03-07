"use client";

import { useState, useEffect } from "react";
import type { AnalyzeStep } from "@/data/demo-scenario";

interface ProcessingAnimationProps {
  steps: AnalyzeStep[];
  onComplete: () => void;
}

export default function ProcessingAnimation({
  steps,
  onComplete,
}: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, onComplete]);

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
      </div>
    </div>
  );
}
