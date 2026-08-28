"use client";

import { Sparkles, Globe, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="section-divider" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] via-pink-500 to-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">
                Color<span className="gradient-text">Grade</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Professional cinematic color grading for mobile creators. Studio quality, browser-powered.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Mail, ExternalLink].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Gallery", "API Docs", "Changelog"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Age Verification"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © 2026 ColorGrade. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Built with ♥ for creators who demand the best.
          </p>
        </div>
      </div>
    </footer>
  );
}
