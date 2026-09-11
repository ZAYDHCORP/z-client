"use client";

import { useState } from "react";
import Link from "next/link";
import AuthScreen from "@/components/auth/AuthScreen";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(API.AUTH.FORGOT_PASS, { email });
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Reset your password"
      subtitle="Enter your account email and we will send a secure reset link."
      footer={
        <Link href="/signin" className="font-bold text-[#9a6d35]">
          Back to Sign in
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="text-emerald-500" size={40} />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            If an account exists for that email, a reset link has been sent. Check
            your inbox — the link expires in 30 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Send reset link
          </button>
        </form>
      )}
    </AuthScreen>
  );
}
