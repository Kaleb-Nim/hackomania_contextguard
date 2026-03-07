"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/community", label: "Community" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[960px] items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-text-primary"
        >
          <div className="h-2 w-2 rounded-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-tertiary">
            ContextGuard
          </span>
        </Link>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
                pathname === link.href
                  ? "bg-[rgba(255,255,255,0.08)] text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
