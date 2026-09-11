import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  MessageCircle,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import type { GateHub, GateService } from "@/lib/gate-data";
import SocialLinks from "@/components/SocialLinks";

export default function ServiceLandingModal({
  service,
  hub,
  onClose,
}: {
  service: GateService;
  hub: GateHub;
  onClose: () => void;
}) {
  const Icon = service.icon;
  const ToneBlock = () => (
    <span className="grid size-16 place-items-center rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-black">
      <Icon size={30} />
    </span>
  );

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[#0c0b08]/92 backdrop-blur-xl" role="dialog" aria-modal="true">
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(214,168,92,.30),transparent_38%),linear-gradient(180deg,#120f0b,#050505)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <button onClick={onClose} className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Close service page"><X /></button>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"><span className="font-serif text-base font-black tracking-tight">{hub.key}</span><span className="text-white/60">Gate Services</span></div>
            <a href={hub.whatsapp} target="_blank" rel="noopener noreferrer" className="hidden rounded-full bg-[#d5a85c] px-5 py-3 text-sm font-bold text-black sm:flex items-center gap-2"><MessageCircle size={16} /> Enquire</a>
          </div>

          {/* Hero */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#f4d39b]"><Sparkles size={14} /> {hub.name} Service</div>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">{service.name}</h1>
              <p className="mt-6 max-w-2xl text-2xl font-semibold leading-snug text-white/90">{service.headline}</p>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/65">{service.short}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={hub.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#d5a85c] px-7 py-4 text-sm font-black text-black shadow-xl transition hover:scale-[1.02] flex items-center gap-2"><MessageCircle size={18} /> Enquire on WhatsApp</a>
                <a href={`mailto:connect@drzgate.com?subject=${encodeURIComponent(`${service.name} enquiry`)}`} className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20 flex items-center gap-2"><Mail size={18} /> Email Enquiry</a>
              </div>
            </div>
            <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <ToneBlock />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#f4d39b]">Value Proposition</p>
              <p className="mt-3 text-lg font-semibold leading-snug">{service.value}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">Pricing</p>
                <p className="mt-1 font-bold">{service.pricing}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.contentTypes.map((ct) => <span key={ct} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{ct}</span>)}
              </div>
            </aside>
          </div>

          {/* What it provides */}
          <section className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
            <h2 className="text-3xl font-semibold tracking-tight">What {service.name} provides</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {service.what.map((para, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#d5a85c]" size={20} />
                    <p className="text-base leading-7 text-white/80">{para}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Audience */}
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
              <h2 className="flex items-center gap-2 text-2xl font-semibold"><Users size={22} className="text-[#d5a85c]" /> Who it is for</h2>
              <div className="mt-5 grid gap-3">
                {service.audience.map((a) => <div key={a} className="flex items-center gap-3 rounded-2xl bg-black/20 p-4 text-white/85"><Target size={16} className="text-[#d5a85c]" /> {a}</div>)}
              </div>
            </section>

            {/* Benefits */}
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
              <h2 className="flex items-center gap-2 text-2xl font-semibold"><BadgeCheck size={22} className="text-[#d5a85c]" /> Key benefits</h2>
              <div className="mt-5 grid gap-3">
                {service.benefits.map((b) => <div key={b} className="flex items-start gap-3 rounded-2xl bg-black/20 p-4 text-white/85"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#d5a85c]" /> {b}</div>)}
              </div>
            </section>
          </div>

          {/* Process */}
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Clock size={22} className="text-[#d5a85c]" /> How the engagement works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.process.map((step, i) => (
                <div key={step} className="relative rounded-2xl border border-white/10 bg-black/20 p-5">
                  <span className="absolute -top-3 left-5 grid size-8 place-items-center rounded-full bg-[#d5a85c] text-sm font-black text-black">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 font-semibold text-white/90">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related context */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
              <h2 className="text-xl font-semibold">Related categories</h2>
              <div className="mt-4 flex flex-wrap gap-2">{service.relatedCategories.map((c) => <span key={c} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">#{c}</span>)}</div>
              <h2 className="mt-6 text-xl font-semibold">Related topics</h2>
              <div className="mt-4 flex flex-wrap gap-2">{service.relatedTopics.map((t) => <span key={t} className="rounded-full border border-[#d5a85c]/40 bg-[#d5a85c]/10 px-3 py-1.5 text-sm font-semibold text-[#f4d39b]">#{t}</span>)}</div>
            </div>
            {service.trust && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
                <h2 className="text-xl font-semibold">Why you can trust this service</h2>
                <div className="mt-4 grid gap-3">{service.trust.map((t) => <div key={t} className="flex items-center gap-3 rounded-2xl bg-black/20 p-4 text-white/85"><BadgeCheck size={16} className="text-[#d5a85c]" /> {t}</div>)}</div>
              </div>
            )}
          </section>

          {/* FAQs */}
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
            <h2 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-6 grid gap-3">
              {service.faqs.map((f) => (
                <details key={f.question} className="group rounded-2xl border border-white/10 bg-black/20 p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white/90">
                    {f.question}
                    <ChevronRight size={18} className="shrink-0 text-[#d5a85c] transition group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-base leading-7 text-white/70">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Connect with hub */}
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-9">
            <h2 className="text-xl font-semibold">Connect with {hub.name}</h2>
            <SocialLinks links={hub.socials} className="mt-4" />
          </section>

          {/* Final CTA */}
          <section className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1c150d] to-[#0c0b08] p-8 md:p-12">
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Ready to start with {service.name}?</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">Reach the {hub.name} team directly on WhatsApp to discuss your requirements. Every engagement is scoped with you, never templated.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={hub.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#d5a85c] px-7 py-4 text-sm font-black text-black shadow-xl transition hover:scale-[1.02] flex items-center gap-2"><MessageCircle size={18} /> Enquire on WhatsApp <ArrowRight size={18} /></a>
              <button onClick={onClose} className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20">Back to services</button>
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-white/40">A {hub.key} · Gate service. Explore all four hubs of the Gate knowledge ecosystem.</p>
        </div>
      </div>
    </div>
  );
}
