import type { Metadata } from "next";
import type { ReactNode } from "react";

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

import AnnouncementBar from "@/components/navigation/AnnouncementBar";
import Navbar from "@/components/navigation/Navbar";
import BottomNav from "@/components/navigation/BottomNav";
import Footer from "@/components/layout/Footer";
import AppProviders from "@/components/providers/AppProviders";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — K-pop Albums, Photocards & Official Merch`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A place to discover the next drop, find your favorite artists, and build your collection. Official albums, photocards, lightsticks and merch, shipped across Sri Lanka.",
  applicationName: SITE_NAME,
  keywords: [
    "K-pop",
    "albums",
    "photocards",
    "lightsticks",
    "official merch",
    "pre-order",
    "comeback",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — K-pop Albums, Photocards & Official Merch`,
    description:
      "Discover the next drop, find your favorite artists, and build your collection.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {/* First focusable element on the page. The navbar puts ~10 links ahead
            of the content, so keyboard users need a way past them. */}
        <a
          href="#main"
          className="sr-only rounded-pill bg-accent px-5 py-3 text-body-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to content
        </a>

        {/* Navbar and BottomNav both read the cart count, so the providers wrap
            the whole chrome, not just {children}. */}
        <AppProviders>
          <AnnouncementBar />
          {/* Navbar derives its transparency from usePathname() — no prop from here. */}
          <Navbar />

          {/* pb-20 clears the fixed mobile BottomNav; md:pb-0 because BottomNav is
              md:hidden and the padding would otherwise dangle on desktop. */}
          <main id="main" className="flex-1 pb-20 md:pb-0">
            {children}
          </main>

          <Footer />
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
