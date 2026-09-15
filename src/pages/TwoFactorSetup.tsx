import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthScreen from "@/components/auth/AuthScreen";
import { API } from "@/lib/constants";
import { api } from "@/lib/axios";
import { cachePendingTwoFactorToken, cacheUser, getCachedUser, getPendingTwoFactorToken, getPostLoginPath, parseUserResponse } from "@/lib/client-auth";
import { getErrorMessage } from "@/lib/errors";
import { CheckCircle2, Copy, Loader2, ShieldCheck } from "lucide-react";

type SetupResponse = {
  qrCodeDataUrl?: string;
  manualEntryKey?: string;
};

type VerifyResponse = {
  backupCodes?: string[];
} & Record<string, unknown>;

export default function TwoFactorSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const pendingToken = searchParams.get("pendingToken") || getPendingTwoFactorToken() || null;

  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const [stage, setStage] = useState<"setup" | "backup-codes" | "done">("setup");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const body = pendingToken ? { pendingToken } : {};

    api
      .post(API.AUTH.SETUP_2FA, body)
      .then((res) => setSetup(res.data?.data ?? res.data))
      .catch((err: unknown) => {
        setError(getErrorMessage(err, "Could not start two-step verification setup."));
      })
      .finally(() => setLoading(false));
  }, [pendingToken]);

  const submit = async (verificationCode: string) => {
    if (verificationCode.length !== 6 || verifying) return;

    setError(null);
    setVerifying(true);

    try {
      const res = await api.post(API.AUTH.VERIFY_SETUP_2FA, {
        code: verificationCode,
        ...(pendingToken ? { pendingToken } : {}),
      });

      const data: VerifyResponse = res.data?.data ?? res.data;
      const parsedUser = parseUserResponse(data);

      if (parsedUser) {
        cacheUser({ ...parsedUser, twoFactorEnabled: true });
      } else {
        const existing = getCachedUser();

        if (existing) {
          cacheUser({
            ...existing,
            twoFactorEnabled: true,
          });
        } else if (email) {
          cacheUser({
            email,
            name: email.split("@")[0],
            role: "user",
            membership: "free",
            twoFactorEnabled: true,
          });
        }
      }

      cachePendingTwoFactorToken(null);

      if (Array.isArray(data?.backupCodes) && data.backupCodes.length > 0) {
        setBackupCodes(data.backupCodes);
        setStage("backup-codes");
      } else {
        setStage("done");
        window.setTimeout(() => navigate(getPostLoginPath(getCachedUser())), 1400);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid verification code."));
    } finally {
      setVerifying(false);
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (stage === "done") {
    return (
      <AuthScreen
        title="Set up two-step verification"
        subtitle="Use an authenticator app to protect your Gate account."
        footer={
          <Link to="/account" className="font-bold text-[#9a6d35]">
            Back to account
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="text-emerald-500" size={40} />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Two-step verification is enabled.
          </p>
        </div>
      </AuthScreen>
    );
  }

  if (stage === "backup-codes") {
    return (
      <AuthScreen
        title="Save your backup codes"
        subtitle="Store these somewhere safe. Each code can only be used once if you lose access to your authenticator app."
        footer={null}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-black/10 bg-black/5 p-4 font-mono text-sm dark:border-white/10 dark:bg-white/5">
            {backupCodes.map((c) => (
              <span
                key={c}
                className="rounded-xl bg-white px-3 py-2 text-center tracking-widest dark:bg-black/30"
              >
                {c}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={copyBackupCodes}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold transition hover:bg-zinc-950 hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black"
          >
            <Copy size={15} />
            {copied ? "Copied!" : "Copy all codes"}
          </button>

          <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-400">
            These codes are shown once and cannot be retrieved again. Save them before continuing.
          </div>

          <button
            type="button"
            onClick={() => navigate(getPostLoginPath(getCachedUser()))}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            I&apos;ve saved my codes — Continue
          </button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Set up two-step verification"
      subtitle="Use an authenticator app to protect your Gate account."
      footer={
        <Link to="/account" className="font-bold text-[#9a6d35]">
          Back to account
        </Link>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-zinc-500" size={28} />
        </div>
      ) : error && !setup ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <Link
            to="/account"
            className="block text-center text-sm font-semibold text-[#9a6d35] hover:underline"
          >
            Back to account
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(code);
          }}
          className="space-y-5"
        >
          <div className="flex justify-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-black">
              <ShieldCheck size={26} />
            </div>
          </div>

          {setup?.qrCodeDataUrl && (
            <img
              src={setup.qrCodeDataUrl}
              alt="Two-step verification QR code"
              className="mx-auto size-52 rounded-2xl border border-black/10 bg-white p-3"
            />
          )}

          {setup?.manualEntryKey && (
            <div className="space-y-1 text-center">
              <p className="text-xs text-zinc-400">Can&apos;t scan? Enter this key manually:</p>
              <div className="rounded-2xl bg-black/5 p-4 text-center text-sm font-semibold tracking-widest dark:bg-white/10">
                {setup.manualEntryKey}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-zinc-500">
            Scan the QR code with Google Authenticator, then enter the 6-digit code below to confirm.
          </p>

          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            disabled={verifying}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
              if (value.length === 6) {
                void submit(value);
              }
            }}
            placeholder="6-digit code"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-center text-sm font-bold tracking-[0.35em] outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {verifying && <Loader2 className="animate-spin" size={16} />}
            Enable 2FA
          </button>
        </form>
      )}
    </AuthScreen>
  );
}