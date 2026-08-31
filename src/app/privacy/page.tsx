import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — ColorGrade",
  description: "How ColorGrade collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        {/* Back link */}
        <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" />
          Back to home
        </Link>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl editorial-heading text-[var(--text-primary)] mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)] mb-12">
          Last updated: August 31, 2026
        </p>

        <div className="h-px bg-[var(--border-subtle)] mb-12" />

        {/* Content */}
        <div className="space-y-10 editorial-body text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              1. Introduction
            </h2>
            <p className="mb-3">
              ColorGrade (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the ColorGrade platform, a browser-based cinematic color grading tool. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              By using ColorGrade, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              2. Data We Collect
            </h2>
            <p className="mb-3">We collect the following types of data:</p>
            <ul className="space-y-2 ml-5 list-disc">
              <li><strong className="text-[var(--text-primary)]">Account Data:</strong> Email address, name, and date of birth (for age verification) when you create an account.</li>
              <li><strong className="text-[var(--text-primary)]">Usage Data:</strong> Browser type, device information, pages visited, time spent, and interaction patterns.</li>
              <li><strong className="text-[var(--text-primary)]">Image Data:</strong> Photos and videos you upload for color grading. These are processed entirely in your browser and are <strong className="text-[var(--accent-teal)]">never uploaded to our servers</strong>.</li>
              <li><strong className="text-[var(--text-primary)]">Payment Data:</strong> Payment information is processed by Stripe. We do not store credit card numbers or payment credentials on our servers.</li>
              <li><strong className="text-[var(--text-primary)]">Cookie Data:</strong> We use cookies and similar technologies to maintain your session, remember preferences, and analyze site traffic.</li>
              <li><strong className="text-[var(--text-primary)]">Access Keys:</strong> When you redeem an access key, we record the key code, tier, and timestamp for validation purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              3. How We Use Your Data
            </h2>
            <ul className="space-y-2 ml-5 list-disc">
              <li>To provide and maintain our color grading services.</li>
              <li>To validate access keys and manage subscription tiers.</li>
              <li>To verify age compliance with COPPA, GDPR, and India&rsquo;s DPDP Act.</li>
              <li>To process payments through Stripe.</li>
              <li>To communicate with you about your account, updates, or support.</li>
              <li>To analyze usage patterns and improve our platform.</li>
              <li>To detect and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              4. Image Processing & Storage
            </h2>
            <p className="mb-3">
              ColorGrade uses <strong className="text-[var(--text-primary)]">client-side Canvas 2D rendering</strong>. All image processing happens directly in your browser using the HTML5 Canvas API. Your images and videos:
            </p>
            <ul className="space-y-2 ml-5 list-disc">
              <li>Are <strong className="text-[var(--accent-teal)]">never uploaded to our servers</strong>.</li>
              <li>Are stored temporarily in your browser&rsquo;s memory only.</li>
              <li>Are automatically cleared when you close the tab or refresh the page.</li>
              <li>Cannot be accessed by us or any third party.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              5. Cookies & Tracking
            </h2>
            <p className="mb-3">We use the following types of cookies:</p>
            <ul className="space-y-2 ml-5 list-disc">
              <li><strong className="text-[var(--text-primary)]">Strictly Necessary:</strong> Required for authentication, session management, and security. Cannot be disabled.</li>
              <li><strong className="text-[var(--text-primary)]">Analytics:</strong> Help us understand how visitors interact with the site (e.g., Google Analytics). Optional — requires your consent.</li>
              <li><strong className="text-[var(--text-primary)]">Marketing:</strong> Used to deliver relevant ads and measure campaign effectiveness. Optional — requires your consent.</li>
            </ul>
            <p className="mt-3">
              You can manage your cookie preferences at any time through the cookie consent banner or your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              6. Data Sharing
            </h2>
            <p className="mb-3">We may share your data with:</p>
            <ul className="space-y-2 ml-5 list-disc">
              <li><strong className="text-[var(--text-primary)]">Stripe:</strong> For payment processing. Stripe&rsquo;s privacy policy applies.</li>
              <li><strong className="text-[var(--text-primary)]">Supabase:</strong> For authentication and database services. Supabase&rsquo;s privacy policy applies.</li>
              <li><strong className="text-[var(--text-primary)]">Analytics providers:</strong> If you consent to analytics cookies.</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-[var(--text-primary)]">not sell</strong> your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              7. Data Retention
            </h2>
            <ul className="space-y-2 ml-5 list-disc">
              <li><strong className="text-[var(--text-primary)]">Account data:</strong> Retained as long as your account is active. Deleted within 30 days of account deletion.</li>
              <li><strong className="text-[var(--text-primary)]">Access keys:</strong> Retained for validation and audit purposes. Consumed keys are retained indefinitely for fraud prevention.</li>
              <li><strong className="text-[var(--text-primary)]">Usage data:</strong> Anonymized and retained for up to 24 months.</li>
              <li><strong className="text-[var(--text-primary)]">Images:</strong> Never stored on our servers. Processed in-browser only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              8. Your Rights
            </h2>
            <p className="mb-3">Depending on your jurisdiction, you have the right to:</p>
            <ul className="space-y-2 ml-5 list-disc">
              <li><strong className="text-[var(--text-primary)]">Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong className="text-[var(--text-primary)]">Rectification:</strong> Request correction of inaccurate data.</li>
              <li><strong className="text-[var(--text-primary)]">Erasure:</strong> Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong className="text-[var(--text-primary)]">Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong className="text-[var(--text-primary)]">Objection:</strong> Object to processing of your data for certain purposes.</li>
              <li><strong className="text-[var(--text-primary)]">Withdraw Consent:</strong> Withdraw previously given consent at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at <strong className="text-[var(--accent-teal)]">privacy@colorgrade.app</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              9. Age Compliance
            </h2>
            <p className="mb-3">
              We comply with COPPA (Children&rsquo;s Online Privacy Protection Act), GDPR (General Data Protection Regulation), and India&rsquo;s DPDP Act (Digital Personal Data Protection Act).
            </p>
            <ul className="space-y-2 ml-5 list-disc">
              <li>Users must be at least <strong className="text-[var(--text-primary)]">13 years old</strong> to use ColorGrade.</li>
              <li>Users aged 13–17 require parental or guardian consent.</li>
              <li>We collect date of birth during signup to verify age compliance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              10. Security
            </h2>
            <p className="mb-3">
              We implement industry-standard security measures including:
            </p>
            <ul className="space-y-2 ml-5 list-disc">
              <li>Encryption in transit (TLS/SSL).</li>
              <li>Row Level Security (RLS) on all database tables.</li>
              <li>Server-side authentication verification on all API routes.</li>
              <li>Webhook signature verification for payment events.</li>
              <li>Regular security audits and updates.</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              11. International Data Transfers
            </h2>
            <p>
              Your data may be processed in countries other than your own. By using ColorGrade, you consent to such transfers. We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. Your continued use of ColorGrade after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              13. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at:
            </p>
            <p className="mt-2">
              <strong className="text-[var(--accent-teal)]">privacy@colorgrade.app</strong>
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)]">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            ← Back to ColorGrade
          </Link>
        </div>
      </div>
    </div>
  );
}
