import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AccountContent } from "@/components/AccountContent";

export default function AccountPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%)]" />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#9a6d35]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <Link to="/" className="mb-6 inline-block">
          <Logo compact />
        </Link>

        <AccountContent />
      </div>
    </main>
  );
}
