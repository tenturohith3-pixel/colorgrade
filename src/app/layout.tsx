import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ColorGrade — Cinematic Color Correction for Creators",
  description:
    "Professional video color grading in your browser. LUT presets, 3-way color wheels, HSL curves, and AI-powered corrections for mobile creators.",
  keywords: [
    "color grading",
    "video editing",
    "LUT",
    "color correction",
    "cinematic",
    "mobile creators",
  ],
  openGraph: {
    title: "ColorGrade — Cinematic Color Correction",
    description: "Professional color grading for mobile creators",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased noise">
        {children}
        <div id="cursor-dot" className="cursor-dot hidden lg:block" />
      </body>
    </html>
  );
}
