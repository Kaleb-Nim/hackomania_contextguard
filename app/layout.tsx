import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextGuard",
  description: "Rumour Pre-Mortem Engine — Singapore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="relative z-1">{children}</div>
      </body>
    </html>
  );
}
