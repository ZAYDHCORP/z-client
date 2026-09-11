import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthScreen from "@/components/auth/AuthScreen";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { cachePendingTwoFactorToken, cacheUser } from "@/lib/client-auth";

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMap: Record<string, string> = {
        oauth_failed: "Google sign-in failed. Please try again.",
        account_not_found: "No account found for this Google profile.",
        default: "Authentication error. Please try again.",
      };
      setError(errorMap[errorParam] ?? errorParam);
    }
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(API.AUTH.LOGIN, { email, password });
      const data = res.data;
      const authData = data?.data ?? data;
      const pendingToken = authData?.pendingToken;
      console.log("DATA AFTER LOGIN---",data)

      if (typeof pendingToken === "string") {
        cachePendingTwoFactorToken(pendingToken);
      }

      if (authData?.twoFactorSetupRequired) {
        navigate(
          `/two-factor/setup?email=${encodeURIComponent(email)}&pendingToken=${encodeURIComponent(pendingToken ?? "")}`
        );
        return;
      }

      if (authData?.requiresTwoFactor || authData?.twoFactorRequired) {
        navigate(
          `/two-factor?email=${encodeURIComponent(email)}&pendingToken=${encodeURIComponent(pendingToken ?? "")}`
        );
        return;
      }

      if (authData?.user) cacheUser(authData.user);
      else cacheUser({ email, name: email.split("@")[0], role: "user", membership: "free" });
      cachePendingTwoFactorToken(null);

      const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
      navigate(callbackUrl);
    } catch (err: any) {
      setError(err?.message ?? "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue your knowledge journey."
      footer={
        <>
          New to Gate?{" "}
          <Link to="/signup" className="font-bold text-[#9a6d35]">
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons />
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-600 dark:text-amber-500">
          <span>{error}</span>
        </div>
      )}
      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        OR
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>
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
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Login
        </button>
      </form>
      <div className="mt-4 text-right">
        <Link to="/forgot-password" className="text-sm font-semibold text-[#9a6d35]">
          Forgot Password?
        </Link>
      </div>
      <p className="mt-6 text-center text-xs text-zinc-400">
        By continuing you agree to our{" "}
        <Link to="/terms" className="underline">Terms</Link> and{" "}
        <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </AuthScreen>
  );
}
