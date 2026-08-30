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
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ColorGrade — Editorial Color Grading for Cinematic Creators",
  description:
    "Professional video color grading in your browser. LUT presets, 3-way color wheels, HSL curves, and AI-powered corrections — crafted for cinematic storytelling.",
  keywords: [
    "color grading",
    "video editing",
    "LUT",
    "color correction",
    "cinematic",
    "editorial",
    "film grading",
  ],
  openGraph: {
    title: "ColorGrade — Editorial Color Grading",
    description: "Professional color grading for cinematic creators",
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
      <body className="min-h-screen bg-background text-foreground antialiased noise grain">
        {children}
        <div id="cursor-dot" className="cursor-dot hidden lg:block" />
      </body>
    </html>
  );
}
