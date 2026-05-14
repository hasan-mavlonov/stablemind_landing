import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import { ThemeProviderScript } from "@/components/shared/ThemeToggle";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "700"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mindform. The personality layer for AI.",
  description:
    "Drop a personality into anything. Robots. NPCs. Companions. Influencers. Built once, lives anywhere.",
  metadataBase: new URL("https://mindform-ai.com"),
  openGraph: {
    title: "Mindform. The personality layer for AI.",
    description: "Drop a personality into anything.",
    url: "https://mindform-ai.com",
    siteName: "Mindform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeProviderScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
