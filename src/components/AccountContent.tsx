import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, LogOut, ShieldOff, ShieldCheck, Upload, KeyRound, Crown } from "lucide-react";
import { validatePassword } from "@/lib/validation";
import { api } from "@/lib/axios";
import { API } from "@/lib/constants";
import { cacheUser, getCachedUser, logoutCurrentUser } from "@/lib/client-auth";
import { getErrorMessage, isSessionExpired } from "@/lib/errors";
import { cn } from "@/lib/utils";

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

/**
 * The actual profile-editing UI (avatar, name, security, membership, sign
 * out) with no page chrome of its own — used both by the standalone
 * /account page (public site) and the /admin/profile page (rendered inside
 * AdminShell), so an admin never has to leave the dashboard to see it.
 *
 * `wide` lays Profile and Security out side by side — pass it only from a
 * container that's actually wide (the admin dashboard canvas); the public
 * /account page stays a single narrow centered column, where a forced
 * two-column split would just cramp both sections instead of helping.
 */
export function AccountContent({ wide = false }: { wide?: boolean }) {
  const navigate = useNavigate();
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
      navigate("/signin?callbackUrl=/account", { replace: true });
      setLoading(false);
      return;
    }
    // No PROFILE endpoint on the backend — cached user (set at login /
    // 2FA setup / disable) is the single source of truth.
    setProfile(cached);
    setName(cached.name ?? "");
    setImage(cached.image ?? "");
    setLoading(false);
  }, [navigate]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const nextProfile = profile ? { ...profile, name, image } : { name, image };
      setProfile(nextProfile);
      cacheUser(nextProfile);
      setSuccess("Saved on this device — the backend doesn't have a profile-update endpoint yet, so this doesn't sync to other devices.");
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
      if (isSessionExpired(err)) {
        setDisable2faError("Your session expired while confirming. Please re-enter your password.");
      } else {
        setDisable2faError(getErrorMessage(err, "Could not disable two-step verification. Check your password."));
      }
    } finally {
      setDisabling2fa(false);
    }
  };

  const signOut = async () => {
    await logoutCurrentUser();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">Session expired.</p>
          <Link to="/signin" className="font-bold text-[#9a6d35]">
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  const isSocial = profile.provider ? profile.provider !== "credentials" : false;

  return (
    <div>
      {/* Hero */}
      <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="h-20 bg-gradient-to-r from-[#9a6d35]/30 via-[#d5a85c]/20 to-transparent dark:from-[#d5a85c]/25 dark:via-[#9a6d35]/15" />
        <div className="-mt-12 flex flex-wrap items-end gap-4 px-7 pb-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#f4f0e8] bg-zinc-950 text-3xl font-bold text-white shadow-lg dark:border-[#090908] dark:bg-white dark:text-black">
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              (name || profile.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold tracking-tight">
                {name || "Your account"}
              </h1>
              {profile.role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#9a6d35]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a6d35]">
                  <ShieldCheck size={11} /> Admin
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {profile.email}
              {profile.emailVerified ? " · Verified" : ""}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 pb-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">
              <Upload size={14} /> Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="text-xs font-semibold text-zinc-500 hover:text-red-500"
              >
                Remove photo
              </button>
            )}
          </div>
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

      <div className={cn("mt-6", wide && "grid items-start gap-5 md:grid-cols-2")}>
      <section className={cn("rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5", wide && "mt-0")}>
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6d35]/10 text-[#9a6d35]">
            <Upload size={15} />
          </span>
          Profile
        </h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-3">
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
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
          <p className="text-xs text-zinc-500">
            Saved to this browser only — the backend doesn't have a profile-update endpoint yet.
          </p>
        </form>
      </section>

      <section className={cn("rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5", wide ? "mt-0" : "mt-5")}>
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6d35]/10 text-[#9a6d35]">
            <KeyRound size={15} />
          </span>
          Security
        </h2>
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
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9a6d35]/10 text-[#9a6d35]">
            <Crown size={18} />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold">Membership</p>
            <p className="text-sm capitalize text-zinc-500">{profile.membership ?? "free"}</p>
          </div>
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
  );
}
