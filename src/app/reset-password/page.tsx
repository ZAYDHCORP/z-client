"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthScreen from "@/components/auth/AuthScreen";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { getPasswordStrength } from "@/lib/password-strength";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"][
    strength.score
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }
    if (strength.score < 2) {
      setError("Please choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post(API.AUTH.RESET_PASS, { token, password });
      setDone(true);
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Set a new password"
      subtitle="Choose a strong password you don't use anywhere else."
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
            Your password has been reset. Redirecting you to sign in…
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 pr-12 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength.score >= level ? strengthColor : "bg-black/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                <span className="font-semibold">{strength.label}</span>
                {strength.hint ? ` — ${strength.hint}` : ""}
              </p>
            </div>
          )}
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Reset password
          </button>
        </form>
      )}
    </AuthScreen>
  );
}
