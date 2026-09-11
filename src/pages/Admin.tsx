import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminSession, AdminSession } from "@/lib/admin-auth";

export default function AdminPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setAdmin(session);
  }, [navigate]);

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#090908] px-6 py-12 text-[#f6f0e5]" />
    );
  }

  return (
    <main className="min-h-screen bg-[#090908] px-6 py-12 text-[#f6f0e5]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="gate-dot heartbeat" />
          <span className="text-3xl gate-wordmark">Gate</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold tracking-widest">
            ADMIN
          </span>
        </div>
        <h1 className="font-serif text-3xl font-semibold">Control room</h1>
        <p className="mt-2 text-zinc-400">
          Signed in as <span className="font-semibold text-[#f6f0e5]">{admin.email}</span> · role{" "}
          <span className="capitalize">{admin.role}</span>.
        </p>
        <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
          The content management console lives inside the Gate application. Open the
          app and sign in with this administrator account to access publishing tools
          from the staff-only menu.
        </p>
      </div>
    </main>
  );
}
