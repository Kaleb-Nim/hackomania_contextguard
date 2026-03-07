"use client";

import { useState, useEffect } from "react";
import { DEMO_SCENARIO } from "@/data/demo-scenario";

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
  const [toastMessage, setToastMessage] = useState("");
  const [isErrorToast, setIsErrorToast] = useState(false);
  const [telegramId, setTelegramId] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleConfirm = async () => {
    setIsDeploying(true);
    let hasError = false;
    let errorMessage = "";
    
    try {
      if (telegramId) {
        const counterNarrativesText = DEMO_SCENARIO.predictions.map(p => 
          `🚨 ${p.title}\n` +
          `EN: ${p.counterNarratives.en}\n\n` +
          `ZH: ${p.counterNarratives.zh}\n\n` +
          `MS: ${p.counterNarratives.ms}\n\n` +
          `TA: ${p.counterNarratives.ta}`
        ).join('\n\n=========================\n\n');

        const messageText = `🛡️ ContextGuard Alert 🛡️\n\nCounter-narratives have been successfully deployed to ${communityLeadersCount} verified community leaders across ${constituencies} constituencies.\n\n=========================\n\n${counterNarrativesText}`;

        const res = await fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: telegramId,
            message: messageText,
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
           hasError = true;
           errorMessage = data.error || "Failed to send message";
           console.error("Telegram API Error:", data.error);
        }
      }
    } catch (error: any) {
      hasError = true;
      errorMessage = error.message || "Network error";
      console.error("Failed to send telegram message", error);
    } finally {
      setIsDeploying(false);
      setShowModal(false);
      
      if (hasError) {
         setToastMessage(`Error: ${errorMessage}`);
         setIsErrorToast(true);
      } else {
         setToastMessage(`\u2713 Counter-narratives deployed to ${communityLeadersCount} community leaders` + (telegramId ? " and Telegram" : ""));
         setIsErrorToast(false);
         setTelegramId("");
      }
      
      setShowToast(true);
    }
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
            <p className="mb-4 text-[13px] text-text-secondary">
              Counter-narratives will be sent to{" "}
              <span className="font-semibold text-text-primary">
                {communityLeadersCount} verified community leaders
              </span>{" "}
              across {constituencies} constituencies in 4 languages.
            </p>
            
            <div className="mb-6">
              <label htmlFor="telegramId" className="mb-1.5 block text-[12px] font-medium text-text-tertiary">
                Notify via Telegram (Optional)
              </label>
              <input
                id="telegramId"
                type="text"
                placeholder="Enter Telegram @username or Chat ID"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13px] text-text-primary focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeploying}
                className="cursor-pointer text-[12px] font-medium text-text-tertiary disabled:opacity-50"
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
                disabled={isDeploying}
                className="flex cursor-pointer items-center justify-center gap-2 text-[13px] font-bold text-white disabled:opacity-70"
                style={{
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                {isDeploying ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deploying...
                  </>
                ) : (
                  "Confirm & Deploy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div
          className="fixed top-4 right-4 z-50 max-w-md"
          style={{
            padding: "12px 18px",
            background: isErrorToast ? "rgba(239, 68, 68, 0.15)" : "rgba(34,197,94,0.15)",
            border: isErrorToast ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(34,197,94,0.3)",
            borderRadius: 8,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span className={`text-[13px] font-semibold ${isErrorToast ? "text-red-400" : "text-accent-green"}`}>
            {toastMessage}
          </span>
        </div>
      )}
    </>
  );
}
