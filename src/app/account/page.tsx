"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, LogOut, ArrowLeft, ShieldOff } from "lucide-react";
import { validatePassword } from "@/lib/validation";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { cacheUser, getCachedUser, logoutCurrentUser } from "@/lib/client-auth";

type Profile = {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  membership?: string | null;
  provider?: string | null;
  emailVerified?: Date | string | null;
  createdAt?: Date | string | null;
  twoFactorEnabled?: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showDisable2faDialog, setShowDisable2faDialog] = useState(false);
  const [disable2faPassword, setDisable2faPassword] = useState("");
  const [disabling2fa, setDisabling2fa] = useState(false);
  const [disable2faError, setDisable2faError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedUser();
    if (!cached?.email) {
      router.replace("/signin?callbackUrl=/account");
      setLoading(false);
      return;
    }
    // No PROFILE endpoint on the backend — cached user (set at login /
    // 2FA setup / disable) is the single source of truth.
    setProfile(cached);
    setName(cached.name ?? "");
    setImage(cached.image ?? "");
    setLoading(false);
  }, [router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const nextProfile = profile ? { ...profile, name, image } : { name, image };
      setProfile(nextProfile);
      cacheUser(nextProfile);
      setSuccess("Profile updated.");
    } catch {
      setError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    setPwSaving(true);
    try {
      setError("Password changes are not available until the backend exposes this endpoint.");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setPwSaving(false);
    }
  };

  const disable2fa = async () => {
    if (!disable2faPassword) {
      setDisable2faError("Please enter your password to confirm.");
      return;
    }
    setDisable2faError(null);
    setDisabling2fa(true);
    try {
      await api.post(
        API.AUTH.DISABLE_2FA,
        { password: disable2faPassword },
        { skipAuthRedirect: true }
      );
      setProfile((p) => {
        const next = p ? { ...p, twoFactorEnabled: false } : p;
        if (next) cacheUser(next);
        return next;
      });
      setSuccess("Two-step verification disabled.");
      setShowDisable2faDialog(false);
      setDisable2faPassword("");
    } catch (err: unknown) {
      console.log("Error in disabling---",err)
      const e = err as { message?: string; sessionExpired?: boolean };
      if (e?.sessionExpired) {
        setDisable2faError("Your session expired while confirming. Please re-enter your password.");
      } else {
        setDisable2faError(e?.message ?? "Could not disable two-step verification. Check your password.");
      }
    } finally {
      setDisabling2fa(false);
    }
  };

  const signOut = async () => {
    await logoutCurrentUser();
    router.replace("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f0e8] dark:bg-[#090908]">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f0e8] dark:bg-[#090908]">
        <div className="text-center">
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">Session expired.</p>
          <Link href="/signin" className="font-bold text-[#9a6d35]">
            Sign in again
          </Link>
        </div>
      </main>
    );
  }

  const isSocial = profile.provider ? profile.provider !== "credentials" : false;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%)]" />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#9a6d35]"
        >
          <ArrowLeft size={16} /> Back to Gate
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="gate-logo-wrapper cursor-pointer select-none">
            <span className="gate-dot heartbeat" />
            <span className="text-4xl gate-wordmark gate-reveal">Gate</span>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Your account</h1>
            <p className="text-sm text-zinc-500">
              {profile.email}
              {profile.emailVerified ? " · Verified" : ""}
            </p>
          </div>
        </div>

        {success && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}
        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <section className="mt-8 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-xl font-semibold">Profile</h2>
          <form onSubmit={saveProfile} className="mt-4 grid gap-3">
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
            />
            <label className="text-sm font-medium">Photo URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
            />
            <button
              type="submit"
              disabled={saving}
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              Save changes
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-xl font-semibold">Security</h2>
          <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm dark:bg-white/10">
            <p className="font-semibold">Two-step verification</p>
            <p className="mt-1 text-zinc-500">
              {profile.twoFactorEnabled
                ? "Enabled — your account is protected with an authenticator app."
                : "Add an extra layer of security using Google Authenticator or any TOTP app."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              
              {profile.twoFactorEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setDisable2faPassword("");
                    setDisable2faError(null);
                    setShowDisable2faDialog(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold transition hover:bg-red-500 hover:text-white hover:border-red-500 dark:border-white/15 dark:bg-white/10 dark:hover:bg-red-500 dark:hover:border-red-500"
                >
                  <ShieldOff size={13} /> Disable 2FA
                </button>
              )}
            </div>
          </div>

          {showDisable2faDialog && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/80 p-4 dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Confirm password to disable 2FA
              </p>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                Turning off 2FA means your next login will start the QR code setup from the beginning.
              </p>
              <div className="mt-3 grid gap-2">
                <input
                  type="password"
                  value={disable2faPassword}
                  onChange={(e) => setDisable2faPassword(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && void disable2fa()}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 dark:border-white/10 dark:bg-black/30"
                />
                {disable2faError && (
                  <p className="text-xs font-medium text-red-600">{disable2faError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void disable2fa()}
                    disabled={disabling2fa}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    {disabling2fa && <Loader2 className="animate-spin" size={13} />}
                    Disable 2FA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisable2faDialog(false)}
                    className="flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs font-bold transition hover:bg-zinc-950 hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {isSocial ? (
            <p className="mt-3 text-sm text-zinc-500">
              You signed in with {profile.provider === "google" ? "Google" : profile.provider === "apple" ? "Apple" : profile.provider}. Password sign-in is not enabled for this account.
            </p>
          ) : (
            <form onSubmit={changePassword} className="mt-4 grid gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9a6d35] dark:border-white/10 dark:bg-black/30"
              />
              <button
                type="submit"
                disabled={pwSaving}
                className="mt-1 flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3.5 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-60 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black"
              >
                {pwSaving && <Loader2 className="animate-spin" size={16} />}
                Change password
              </button>
            </form>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="font-serif text-lg font-semibold">Membership</p>
            <p className="text-sm capitalize text-zinc-500">{profile.membership ?? "free"}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </main>
  );
}