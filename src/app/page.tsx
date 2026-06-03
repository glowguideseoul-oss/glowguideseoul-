import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SponsorTicker from "@/components/SponsorTicker";
import VisitorBanner from "@/components/VisitorBanner";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seoul Glow Guide — Seoul Clinic Concierge",
  description:
    "Find the right Seoul clinic before you fly. Compare foreigner-ready clinics, prepare the right questions, and plan your visit with confidence.",
  openGraph: {
    url: "https://glowguideseoul.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Seoul Glow Guide",
  url: "https://glowguideseoul.com",
  description: "Seoul Clinic Concierge for medical travelers.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://glowguideseoul.com/#clinics",
    "query-input": "required name=search_term_string",
  },
};
import ClinicCardGrid from "@/components/ClinicCardGrid";
import ClinicGuideFinder from "@/components/ClinicGuideFinder";
import JourneyTabs from "@/components/JourneyTabs";
import HeroButtons from "@/components/HeroButtons";
import LogoMark from "@/components/LogoMark";
import ExitIntentModal from "@/components/ExitIntentModal";
import ScrollCTABar from "@/components/ScrollCTABar";
import { getPublishedClinics } from "@/lib/clinics-db";
import { CalendarDays, Languages, ClipboardList, ShieldCheck, MapPin, Plane, Pill, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { data: views } = await getSupabase()
    .from("page_views")
    .select("country_code");

  const totalVisits = views?.length ?? 0;
  const countryCounts: Record<string, number> = {};
  for (const v of (views ?? [])) {
    if (v.country_code) {
      countryCounts[v.country_code] = (countryCounts[v.country_code] ?? 0) + 1;
    }
  }

  const publishedClinics = await getPublishedClinics();

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExitIntentModal />
      <ScrollCTABar />
      <VisitorBanner totalVisits={totalVisits} countryCounts={countryCounts} />
      <Navbar />
      <SponsorTicker />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-14 pb-20">
        <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 md:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_390px]">
            <div className="py-8 md:py-12">
              <div className="inline-flex items-center gap-2 bg-jade-light text-jade-dark rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
                <LogoMark className="h-4 w-4" />
                Seoul Clinic Concierge for medical travelers
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-ink leading-[0.98] mb-6 max-w-3xl">
                Find the right Seoul clinic before you fly
              </h1>

              <p className="text-soft text-lg max-w-xl mb-10 leading-relaxed">
                Compare foreigner-ready clinics, prepare the right questions, and plan your visit
                with confidence.
              </p>

              <HeroButtons />
            </div>

            <div className="rounded-[30px] border border-border/80 bg-white/50 p-2 shadow-2xl sm:rounded-[38px] sm:p-3">
              <div className="rounded-[30px] border border-border bg-milk/90 p-5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <LogoMark className="h-4 w-4 text-jade-dark" />
                    Seoul Glow
                  </span>
                  <span>Seoul · Today</span>
                </div>
                <div className="my-5 rounded-[26px] border border-border bg-[linear-gradient(90deg,rgba(234,216,198,.55)_1px,transparent_1px),linear-gradient(rgba(234,216,198,.55)_1px,transparent_1px)] bg-[length:34px_34px] p-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-light px-3 py-1 text-xs font-semibold text-coral-dark">
                    <MapPin size={13} />
                    Clinic Concierge
                  </span>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-0.5 flex-1 rounded-full bg-jade/30" />
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jade text-white shadow-lg">
                      <MapPin size={20} />
                    </span>
                    <span className="h-0.5 flex-1 rounded-full bg-jade/30" />
                  </div>
                  <p className="mb-0 text-sm font-medium text-soft">Hotel → Clinic → Pharmacy → Aftercare</p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/70 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-jade-light text-jade-dark">
                      <CalendarDays size={16} />
                    </div>
                    <span className="text-sm font-semibold text-ink">Today in Seoul</span>
                  </div>
                  {[
                    { time: "09:30", label: "Leave hotel", icon: <Plane size={14} />, done: true },
                    { time: "10:15", label: "Clinic consultation", icon: <MapPin size={14} />, highlight: true },
                    { time: "13:00", label: "Pick up medication", icon: <Pill size={14} /> },
                  ].map((item) => (
                    <div key={item.time} className="grid grid-cols-[48px_22px_1fr] items-center gap-2 border-b border-border py-2.5 last:border-0">
                      <span className="text-xs font-semibold text-muted">{item.time}</span>
                      <span className={item.highlight ? "text-coral" : "text-jade-dark"}>{item.icon}</span>
                      <span className={`text-sm ${item.done ? "text-muted line-through" : item.highlight ? "font-semibold text-coral-dark" : "text-ink"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClinicGuideFinder clinics={publishedClinics} />

      {/* Journey Tabs */}
      <section className="border-y border-border/70 bg-milk/55 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-ink mb-3">Plan every step</h2>
            <p className="text-muted">From your first search to full recovery.</p>
          </div>
          <JourneyTabs />
        </div>
      </section>

      {/* Why it matters */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-ink mb-3">Why travelers use it</h2>
          <p className="text-muted">Navigating Korean clinics as a foreigner can be overwhelming.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Languages size={22} className="text-jade-dark" />, title: "Language barrier", desc: "Consent forms, staff, aftercare guides — all in Korean." },
            { icon: <ClipboardList size={22} className="text-jade-dark" />, title: "No checklist", desc: "Patients arrive unprepared, extending consultations." },
            { icon: <ShieldCheck size={22} className="text-jade-dark" />, title: "Trust gap", desc: "Hard to verify clinic quality without reading Korean reviews." },
            { icon: <CalendarDays size={22} className="text-jade-dark" />, title: "Post-care falloff", desc: "Follow-up channels disappear once you leave Korea." },
          ].map((item) => (
            <div key={item.title} className="soft-card rounded-[28px] p-6">
              <div className="w-11 h-11 bg-jade-light rounded-2xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-ink text-sm mb-2">{item.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinic guides */}
      <section id="clinics" className="bg-milk/60 border-y border-border/70 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl text-ink mb-2">Clinic guides</h2>
              <p className="text-muted text-sm">Sponsored clinics with foreigner-ready information.</p>
            </div>
          </div>
          <ClinicCardGrid clinics={publishedClinics} />
        </div>
      </section>

      {/* For Clinics CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="rounded-[34px] bg-ink p-10 md:p-14 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm mb-6">
            For clinic operators
          </div>
          <h2 className="font-serif text-4xl text-white mb-4 max-w-lg mx-auto">
            Reach international patients planning clinic visits in Korea
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            Showcase your clinic information, supported languages, and aftercare support to medical travelers.
          </p>
          <Link
            href="/for-clinics"
            className="inline-flex items-center gap-2 bg-jade text-white rounded-full px-7 py-3.5 font-semibold hover:bg-jade-dark transition-colors"
          >
            Request clinic listing
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 font-serif text-ink">
            <LogoMark className="h-5 w-5 text-jade-dark" />
            Seoul Glow Guide
          </span>
          <p className="text-muted text-xs text-center max-w-md">
            Seoul Glow Guide provides travel and appointment preparation support only.
            It does not provide medical advice, diagnosis, or treatment recommendations.
          </p>
        </div>
      </footer>
    </div>
  );
}
