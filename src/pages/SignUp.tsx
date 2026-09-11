import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthScreen from "@/components/auth/AuthScreen";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { getPasswordStrength } from "@/lib/password-strength";
import { cachePendingTwoFactorToken, cacheUser } from "@/lib/client-auth";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"][
    strength.score
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (strength.score < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    setLoading(true);
    try {
      await api.post(API.AUTH.REGISTER, { firstName, lastName, email, password,confirmPassword });
      // Auto sign-in after registration
      const res = await api.post(API.AUTH.LOGIN, { email, password });
      const data = res.data?.data ?? res.data;
      const pendingToken = data?.pendingToken;
      if (typeof pendingToken === "string") {
        cachePendingTwoFactorToken(pendingToken);
      }
      if (data?.twoFactorSetupRequired) {
        navigate(
          `/two-factor/setup?email=${encodeURIComponent(email)}&pendingToken=${encodeURIComponent(pendingToken ?? "")}`
        );
        return;
      }
      if (data?.requiresTwoFactor || data?.twoFactorRequired) {
        navigate(
          `/two-factor?email=${encodeURIComponent(email)}&pendingToken=${encodeURIComponent(pendingToken ?? "")}`
        );
        return;
      }
      if (data?.user) cacheUser(data.user);
      else cacheUser({ email, name: `${firstName} ${lastName}`.trim(), role: "user", membership: "free" });
      cachePendingTwoFactorToken(null);
      navigate("/account");
    } catch (err: any) {
      setError(err?.message ?? "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Create your Gate account"
      subtitle="Join the knowledge ecosystem across IPN, IGC, IFR and ISR."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-bold text-[#9a6d35]">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        OR
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="First name"
            value={firstName}
            autoComplete="given-name"
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          <input
            type="text"
            required
            placeholder="Last name"
            value={lastName}
            autoComplete="family-name"
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
        </div>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
        />
        <div>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          {password && (
            <div className="mt-2 space-y-1">
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
        </div>
        <div>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setconfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          {confirmPassword && (
            <div className="mt-2 space-y-1">
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
        </div>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Create Account
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-zinc-400">
        By continuing you agree to our{" "}
        <Link to="/terms" className="underline">Terms</Link> and{" "}
        <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </AuthScreen>
  );
}
