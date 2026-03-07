"use client";

import { useState, useEffect } from "react";

interface ActionPanelProps {
  communityLeadersCount: number;
  constituencies: number;
}

export default function ActionPanel({
  communityLeadersCount,
  constituencies,
}: ActionPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleConfirm = () => {
    setShowModal(false);
    setShowToast(true);
  };

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{
          padding: "18px 22px",
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
          border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: 10,
        }}
      >
        <div>
          <div className="text-[13px] font-bold text-text-primary">
            Deploy to Community Network
          </div>
          <div className="mt-0.5 text-[12px] text-text-tertiary">
            Push counter-narratives to {communityLeadersCount} verified
            community leaders across {constituencies} constituencies
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer text-[13px] font-bold tracking-[0.03em] text-white"
          style={{
            padding: "10px 28px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "none",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(34,197,94,0.25)",
          }}
        >
          Deploy Now &rarr;
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="mx-4 w-full max-w-md"
            style={{
              background: "#141519",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 24,
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            <h3 className="mb-2 text-base font-bold text-text-primary">
              Confirm Deployment
            </h3>
            <p className="mb-6 text-[13px] text-text-secondary">
              Counter-narratives will be sent to{" "}
              <span className="font-semibold text-text-primary">
                {communityLeadersCount} verified community leaders
              </span>{" "}
              across {constituencies} constituencies in 4 languages.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-[12px] font-medium text-text-tertiary"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="cursor-pointer text-[13px] font-bold text-white"
                style={{
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Confirm & Deploy
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div
          className="fixed top-4 right-4 z-50"
          style={{
            padding: "12px 18px",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 8,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span className="text-[13px] font-semibold text-accent-green">
            &#10003; Counter-narratives deployed to {communityLeadersCount}{" "}
            community leaders
          </span>
        </div>
      )}
    </>
  );
}
