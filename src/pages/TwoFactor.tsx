import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthScreen from "@/components/auth/AuthScreen";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { cachePendingTwoFactorToken, cacheUser, getPendingTwoFactorToken } from "@/lib/client-auth";

const CODE_LENGTH = 6;

type Status = "idle" | "success" | "error";

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const pendingToken = searchParams.get("pendingToken") || getPendingTwoFactorToken();

  // "totp" = normal 6-digit code | "backup" = single backup code field
  const [mode, setMode] = useState<"totp" | "backup">("totp");

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [backupCode, setBackupCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const backupRef = useRef<HTMLInputElement | null>(null);

  // Focus the right input whenever mode changes
  useEffect(() => {
    if (mode === "totp") {
      inputRefs.current[0]?.focus();
    } else {
      backupRef.current?.focus();
    }
  }, [mode]);

  const totpCode = digits.join("");
  const isTotpComplete = totpCode.length === CODE_LENGTH && digits.every(Boolean);
  const isBackupComplete = backupCode.trim().length > 0;

  // ── TOTP digit handlers ───────────────────────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      if (pasted.length === CODE_LENGTH) {
        setDigits(pasted.split(""));
        inputRefs.current[CODE_LENGTH - 1]?.focus();
        return;
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

//  const verify = async () => {
//     setError(null);
//     setLoading(true);

//     try {
//       const payload =
//         mode === "totp"
//           ? { email, code: totpCode, pendingToken }
//           : { email, backupCode: backupCode.trim(), pendingToken };

//       const res = await api.post(API.AUTH.VERIFY_LOGIN_2FA, payload);
//       const data = res.data?.data ?? res.data;

//       if (data?.user) cacheUser(data.user);
//       else if (email) cacheUser({ email, name: email.split("@")[0], role: "user", membership: "free" });

//       cachePendingTwoFactorToken(null);
//       setStatus("success");

//       // Let the success animation breathe before navigating away
//       setTimeout(() => {
//         router.push("/account");
//         router.refresh();
//       }, 1100);
//     } catch (err: unknown) {
//       const e = err as { message?: string };
//       setError(e?.message ?? "That code didn't work. Please try again.");
//       setStatus("error");

//       // Show the rejection state briefly, then reset for another attempt
//       setTimeout(() => {
//         setStatus("idle");
//         if (mode === "totp") {
//           setDigits(Array(CODE_LENGTH).fill(""));
//           inputRefs.current[0]?.focus();
//         } else {
//           setBackupCode("");
//           backupRef.current?.focus();
//         }
//       }, 1500);
//     } finally {
//       setLoading(false);
//     }
//   };
  const verify = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload =
        mode === "totp"
          ? { email, code: totpCode, pendingToken }
          : { email, backupCode: backupCode.trim(), pendingToken };

      const res = await api.post(API.AUTH.VERIFY_LOGIN_2FA, payload);
      const data = res.data?.data ?? res.data;

      if (data?.user) cacheUser({ ...data.user, twoFactorEnabled: true });
      else if (email) cacheUser({ email, name: email.split("@")[0], role: "user", membership: "free", twoFactorEnabled: true });

      cachePendingTwoFactorToken(null);
      setStatus("success");

      setTimeout(() => {
        navigate("/account");
      }, 1100);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "That code didn't work. Please try again.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
        if (mode === "totp") {
          setDigits(Array(CODE_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        } else {
          setBackupCode("");
          backupRef.current?.focus();
        }
      }, 1500);
    } finally {
      setLoading(false);
    }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle" || loading) return;
    if (mode === "totp" && !isTotpComplete) return;
    if (mode === "backup" && !isBackupComplete) return;
    void verify();
  };

  // ── Auto-submit once all 6 digits are filled ────────────────────────────────
  useEffect(() => {
    if (mode === "totp" && isTotpComplete && status === "idle" && !loading) {
      void verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  // ── Switch mode ───────────────────────────────────────────────────────────
  const switchMode = () => {
    setError(null);
    setStatus("idle");
    setDigits(Array(CODE_LENGTH).fill(""));
    setBackupCode("");
    setMode((m) => (m === "totp" ? "backup" : "totp"));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthScreen
      title="Two-step verification"
      subtitle={
        mode === "totp"
          ? email
            ? `Enter the 6-digit code from your authenticator app for ${email}.`
            : "Enter the 6-digit code from your authenticator app."
          : "Enter one of your saved backup codes."
      }
      footer={
        <>
          Wrong account?{" "}
          <Link to="/signin" className="font-bold text-[#9a6d35]">
            Back to Sign in
          </Link>
        </>
      }
    >
      {/* Icon badge */}
      <div className="mb-6 flex justify-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-black">
          <ShieldCheck size={26} />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {status !== "idle" ? (
          <StatusPanel
            type={status}
            message={
              status === "success"
                ? "Taking you to your account."
                : error ?? "Please try again."
            }
          />
        ) : mode === "totp" ? (
          /* ── TOTP digit inputs ── */
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={digit}
                disabled={loading}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${i + 1}`}
                className={`h-14 w-11 rounded-2xl border text-center text-xl font-bold outline-none transition
                  ${digit
                    ? "border-[#9a6d35] bg-[#9a6d35]/5 text-zinc-950 dark:text-[#f6f0e5]"
                    : "border-black/10 bg-white dark:border-white/10 dark:bg-black/30"
                  }
                  focus:border-[#9a6d35] focus:ring-2 focus:ring-[#9a6d35]/20
                  disabled:opacity-60
                  dark:border-white/10 dark:bg-black/30`}
              />
            ))}
          </div>
        ) : (
          /* ── Backup code input ── */
          <input
            ref={backupRef}
            type="text"
            value={backupCode}
            disabled={loading}
            onChange={(e) => setBackupCode(e.target.value)}
            placeholder="Backup code"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-center text-sm font-bold tracking-widest outline-none focus:border-[#9a6d35] focus:ring-2 focus:ring-[#9a6d35]/20 disabled:opacity-60 dark:border-white/10 dark:bg-black/30"
          />
        )}

        {/* Manual submit — only for backup codes, since TOTP auto-submits */}
        {status === "idle" && mode === "backup" && (
          <button
            type="submit"
            disabled={loading || !isBackupComplete}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Verify
          </button>
        )}

        {/* Quiet "verifying" cue for the TOTP auto-submit path */}
        {status === "idle" && mode === "totp" && loading && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400">
            <Loader2 className="animate-spin" size={14} /> Verifying…
          </div>
        )}
      </form>

      {/* Mode toggle */}
      {status === "idle" && (
        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full text-center text-xs font-semibold text-[#9a6d35] hover:underline"
        >
          {mode === "totp" ? "Use a backup code instead" : "Use authenticator app instead"}
        </button>
      )}

      {status === "idle" && mode === "totp" && (
        <p className="mt-3 text-center text-xs text-zinc-400">
          Codes refresh automatically in your authenticator app.
        </p>
      )}
    </AuthScreen>
  );
}

// ── Success / rejection panel ─────────────────────────────────────────────
function StatusPanel({ type, message }: { type: "success" | "error"; message: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isSuccess = type === "success";

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div
        className={`grid size-16 place-items-center rounded-full transition-all duration-500 ease-out
          ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"}
          ${isSuccess
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/15 text-red-600 dark:text-red-400"
          }`}
      >
        {isSuccess ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
      </div>

      <div
        className={`text-center transition-all duration-500 delay-100 ease-out
          ${show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <p
          className={`text-base font-bold ${
            isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {isSuccess ? "Verified!" : "Incorrect code"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{message}</p>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <Loader2 className="animate-spin" size={14} /> Redirecting…
        </div>
      )}
    </div>
  );
}