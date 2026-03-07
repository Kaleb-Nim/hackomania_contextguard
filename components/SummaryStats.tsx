interface SummaryStatsProps {
  predictionsCount?: number;
}

export default function SummaryStats({
  predictionsCount = 4,
}: SummaryStatsProps) {
  const stats = [
    {
      label: "Predicted Rumours",
      value: String(predictionsCount),
      sub: `across ${predictionsCount} language communities`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: "16px 18px",
          }}
        >
          <div className="mb-1.5 text-[11px] tracking-[0.06em] uppercase text-text-tertiary">
            {stat.label}
          </div>
          <div className="text-[28px] font-black tracking-tight text-text-primary">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[11px] text-text-muted">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
