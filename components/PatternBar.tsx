interface PatternBarProps {
  similarity: number;
}

export default function PatternBar({ similarity }: PatternBarProps) {
  const gradient =
    similarity > 80
      ? "linear-gradient(90deg, #ef4444, #f59e0b)"
      : similarity > 60
      ? "linear-gradient(90deg, #f59e0b, #3b82f6)"
      : "#3b82f6";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1 flex-1 overflow-hidden rounded-sm"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: `${similarity}%`,
            background: gradient,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <span className="min-w-[32px] font-mono text-[11px] text-text-muted">
        {similarity}%
      </span>
    </div>
  );
}
