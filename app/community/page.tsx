import { DEMO_SCENARIO } from "@/data/demo-scenario";
import CommunityAlertCard from "@/components/CommunityAlertCard";
import Navbar from "@/components/Navbar";

const receivedTimes = [
  "7 Feb 2020, 3:42 PM",
  "7 Feb 2020, 3:42 PM",
  "7 Feb 2020, 3:43 PM",
  "7 Feb 2020, 3:44 PM",
];

const topics = [
  "Potential misinformation about rice shortages",
  "Potential misinformation about COVID case numbers",
  "Potential misinformation about ethnic scapegoating",
  "Potential misinformation about traditional remedies",
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[960px] px-5 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="mb-1 text-[28px] font-black tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #e2e4ea 0%, #8b8fa3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Community Alert
            </h1>
            <p className="text-[13px] text-text-tertiary">
              Pre-verified counter-narratives for your community
            </p>
          </div>
          <span
            className="font-mono text-[11px] font-bold tracking-[0.06em]"
            style={{
              padding: "6px 14px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              color: "#ef4444",
            }}
          >
            {DEMO_SCENARIO.predictions.length} New Alerts
          </span>
        </div>

        <div className="space-y-3">
          {DEMO_SCENARIO.predictions.map((prediction, i) => (
            <div
              key={prediction.id}
              style={{
                animation: `fadeInUp 0.5s ease-out ${i * 0.15}s both`,
              }}
            >
              <CommunityAlertCard
                prediction={prediction}
                receivedTime={receivedTimes[i]}
                topic={topics[i]}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
