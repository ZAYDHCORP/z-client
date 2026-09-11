import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#9a6d35]">
          <span className="gate-dot heartbeat" />
          <span className="text-2xl gate-wordmark">Gate</span>
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: August 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            Welcome to Gate. These Terms govern your access to and use of the Gate
            knowledge platform, including its IPN, IGC, IFR, and ISR hubs and the Z
            experience. By creating an account or using the service, you agree to these
            Terms.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Accounts</h2>
          <p>
            You are responsible for safeguarding your credentials and for all activity
            under your account. You may not share, sell, or transfer your membership. We
            reserve the right to suspend accounts that violate these Terms.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Content</h2>
          <p>
            Gate publishes curated analysis, infographics, books, podcasts, and services
            across its hubs. Content is provided for informational purposes and does not
            constitute professional advice. All intellectual property remains with Gate
            and its contributors.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Membership</h2>
          <p>
            Lifetime and subscription plans are described at the point of purchase.
            Payments are processed by our payment partners. Except where required by law,
            membership fees are non-refundable.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Termination</h2>
          <p>
            You may delete your account at any time from your account settings. We may
            terminate access for conduct that harms other users or the platform.
          </p>
          <p className="text-zinc-500">
            Questions? Contact our team through the channels listed on the site.
          </p>
        </div>
        <p className="mt-10 text-center text-sm text-zinc-400">
          <Link href="/privacy" className="underline">Privacy Policy</Link> ·{" "}
          <Link href="/" className="underline">Back to Gate</Link>
        </p>
      </div>
    </main>
  );
}
