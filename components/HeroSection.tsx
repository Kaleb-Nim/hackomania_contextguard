import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-tertiary">
          System Active
        </span>
      </div>
      <h1
        className="mb-1 text-[48px] font-black tracking-tight"
        style={{
          background: "linear-gradient(135deg, #e2e4ea 0%, #8b8fa3 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ContextGuard
      </h1>
      <p className="mb-10 text-[14px] tracking-[0.02em] text-text-tertiary">
        Rumour Pre-Mortem Engine &mdash; Singapore
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="cursor-pointer text-[13px] font-bold tracking-[0.03em] text-white no-underline transition-all hover:brightness-110"
          style={{
            padding: "12px 32px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "none",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(239,68,68,0.25)",
          }}
        >
          News Outlet Dashboard
        </Link>
        <Link
          href="/community"
          className="cursor-pointer text-[13px] font-semibold text-text-tertiary no-underline transition-all hover:text-text-primary"
          style={{
            padding: "12px 32px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
        >
          Community Leader Portal
        </Link>
      </div>
    </div>
  );
}
