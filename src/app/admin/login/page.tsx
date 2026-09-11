"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { setAdminSession } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(API.ADMIN.LOGIN, { email, password });
      setAdminSession(email);
      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Login failed.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090908] px-5 text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(195,142,71,.22),transparent_30%)]" />
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex items-center gap-2">
          <span className="gate-dot heartbeat" />
          <span className="text-2xl gate-wordmark">Gate</span>
          <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold tracking-widest">
            ADMIN
          </span>
        </div>
        <h1 className="font-serif text-2xl font-semibold">Staff sign in</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Restricted area. Authorized personnel only.
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35]"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35]"
          />
          {error && <p className="text-sm font-medium text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
