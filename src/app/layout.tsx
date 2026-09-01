import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import LoadingScreen from "@/components/LoadingScreen";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ColorGrade — Professional Cinematic Precision",
  description:
    "Professional color grading for the modern creator. LUT presets, 3-way color wheels, and AI-powered corrections — all in your browser.",
  keywords: [
    "color grading",
    "video editing",
    "LUT",
    "color correction",
    "cinematic",
    "film grading",
  ],
  openGraph: {
    title: "ColorGrade — Professional Cinematic Precision",
    description: "Professional color grading for cinematic creators",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ColorGrade",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased noise grain">
        <LoadingScreen />
        {children}
        <CookieConsent />
        <div id="cursor-dot" className="cursor-dot hidden lg:block" />
      </body>
    </html>
  );
}
