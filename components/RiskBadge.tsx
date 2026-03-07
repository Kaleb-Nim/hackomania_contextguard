import type { RiskLevel } from "@/data/demo-scenario";

interface RiskBadgeProps {
  risk: RiskLevel;
  score?: number;
}

const styles: Record<
  RiskLevel,
  { bg: string; border: string; text: string; glow: string }
> = {
  CRITICAL: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    text: "#ef4444",
    glow: "0 0 12px rgba(239,68,68,0.2)",
  },
  HIGH: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    text: "#f59e0b",
    glow: "0 0 12px rgba(245,158,11,0.15)",
  },
  MEDIUM: {
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    text: "#3b82f6",
    glow: "0 0 12px rgba(59,130,246,0.1)",
  },
  LOW: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    text: "#22c55e",
    glow: "0 0 12px rgba(34,197,94,0.1)",
  },
};

export default function RiskBadge({ risk, score }: RiskBadgeProps) {
  const s = styles[risk];
  return (
    <span
      className="inline-flex items-center rounded-md font-mono text-[11px] font-bold tracking-[0.06em]"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        padding: "3px 10px",
        boxShadow: s.glow,
      }}
    >
      {risk}{score !== undefined && <>&nbsp;&mdash; {score}%</>}
    </span>
  );
}
