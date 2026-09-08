import type { Metadata } from "next";

// Self-hosted via @fontsource instead of next/font/google — the sandbox's
// egress allowlist doesn't include fonts.googleapis.com/fonts.gstatic.com,
// so next/font's build-time fetch fails (see .specclaw/changes/001-frontend-foundation).
// Only the weights the type scale (doc §4/§5) actually uses: 400/500/600.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-pop Marketplace",
  description:
    "A premium K-pop marketplace — discover artists, drops, and build your collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
