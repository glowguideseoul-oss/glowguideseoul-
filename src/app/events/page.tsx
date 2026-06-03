import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Tag, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import LogoMark from "@/components/LogoMark";
import { getPublishedEvents } from "@/lib/events-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clinic Events & Promotions — Seoul Glow Guide",
  description: "Exclusive promotions and limited-time offers from Seoul's top aesthetic clinics. Browse events from verified foreigner-ready clinics.",
};

const CATEGORY_COLORS: Record<string, string> = {
  dermatology: "bg-jade-light text-jade-dark",
  plastic_surgery: "bg-coral-light text-coral-dark",
  dental: "bg-sky-50 text-sky-700",
  hair: "bg-amber-50 text-amber-700",
  eye: "bg-violet-50 text-violet-700",
  wellness: "bg-emerald-50 text-emerald-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  dermatology: "Dermatology",
  plastic_surgery: "Plastic Surgery",
  dental: "Dental",
  hair: "Hair",
  eye: "Eye",
  wellness: "Wellness",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-10">
        <div className="glass-panel rounded-[36px] px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-coral-light text-coral-dark rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles size={14} />
            Partner clinic promotions
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4">
            Seoul Clinic Events
          </h1>
          <p className="text-muted text-lg max-w-lg mx-auto leading-relaxed">
            Exclusive offers and limited-time promotions from verified Seoul clinics.
            All events are from partner clinics with foreigner-ready services.
          </p>
        </div>
      </section>

      {/* Events grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📅
            </div>
            <h2 className="font-semibold text-ink mb-2">No events yet</h2>
            <p className="text-muted text-sm mb-6">Partner clinic events will appear here.</p>
            <Link
              href="/for-clinics"
              className="inline-flex items-center gap-2 bg-jade text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-jade-dark transition-colors"
            >
              List your clinic
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div key={event.id} className="soft-card rounded-[28px] overflow-hidden flex flex-col">
                {/* Image or placeholder */}
                <div className="relative h-44 bg-coral-light/40 overflow-hidden rounded-[22px] mx-3 mt-3">
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl text-coral/30">✦</span>
                    </div>
                  )}
                  {/* Sponsored badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-coral text-white text-[10px] font-bold rounded-full px-2.5 py-1">
                    <Sparkles size={9} />
                    Partner Clinic
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Category + location */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${CATEGORY_COLORS[event.clinicType] ?? "bg-border text-muted"}`}>
                      {CATEGORY_LABELS[event.clinicType] ?? event.clinicType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <MapPin size={11} />
                      {event.clinicLocation}
                    </span>
                  </div>

                  {/* Clinic name */}
                  <p className="text-xs font-semibold text-muted mb-1">{event.clinicName}</p>

                  {/* Event title */}
                  <h2 className="font-semibold text-ink text-base leading-snug mb-2">{event.title}</h2>

                  {/* Promo text */}
                  {event.promoText && (
                    <div className="inline-flex items-center gap-1.5 bg-jade-light text-jade-dark rounded-full px-3 py-1.5 text-xs font-bold mb-3 self-start">
                      <Tag size={11} />
                      {event.promoText}
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-3 flex-1">{event.description}</p>
                  )}

                  {/* Dates */}
                  {(event.startDate || event.endDate) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
                      <CalendarDays size={12} />
                      {event.startDate && formatDate(event.startDate)}
                      {event.startDate && event.endDate && " – "}
                      {event.endDate && formatDate(event.endDate)}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/clinics/${event.clinicId}`}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-jade px-4 py-2.5 text-sm font-semibold text-white hover:bg-jade-dark transition-colors"
                  >
                    View clinic guide
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA for clinics */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-[34px] bg-ink p-10 text-center">
          <h2 className="font-serif text-3xl text-white mb-3">Want to feature your clinic?</h2>
          <p className="text-white/60 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Partner clinics can post events and promotions directly to medical travelers planning their Seoul visit.
          </p>
          <Link
            href="/for-clinics"
            className="inline-flex items-center gap-2 bg-jade text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-jade-dark transition-colors"
          >
            Partner with us
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 font-serif text-ink">
            <LogoMark className="h-5 w-5 text-jade-dark" />
            Seoul Glow Guide
          </span>
          <p className="text-muted text-xs text-center max-w-md">
            Events and promotions are posted by partner clinics. Seoul Glow Guide does not provide medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
