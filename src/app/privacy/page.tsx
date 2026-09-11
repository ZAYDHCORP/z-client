import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#9a6d35]">
          <span className="gate-dot heartbeat" />
          <span className="text-2xl gate-wordmark">Gate</span>
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: August 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            Gate respects your privacy. This Policy explains what we collect, why, and the
            choices you have.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Information we collect</h2>
          <p>
            When you create an account, we store your name, email address, and
            authentication method (email/password, Google, or Apple). If you sign in with
            a social provider, we receive only the identity information that provider
            shares. We store the content you bookmark and your interaction preferences.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">How we use it</h2>
          <p>
            We use your information to operate and secure the service, personalize your
            experience, send important account notices, and improve our hubs. We do not
            sell your personal data.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Cookies and sessions</h2>
          <p>
            We use encrypted session cookies to keep you signed in and a separate secure
            cookie for administrator access. These cookies are httpOnly and not accessible
            to scripts.
          </p>
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-[#f6f0e5]">Your rights</h2>
          <p>
            You may access, correct, or delete your data at any time from your account
            settings, or by contacting us. Where applicable, you may request export of your
            data.
          </p>
          <p className="text-zinc-500">
            We may update this Policy; material changes will be communicated through the
            service.
          </p>
        </div>
        <p className="mt-10 text-center text-sm text-zinc-400">
          <Link href="/terms" className="underline">Terms of Service</Link> ·{" "}
          <Link href="/" className="underline">Back to Gate</Link>
        </p>
      </div>
    </main>
  );
}
