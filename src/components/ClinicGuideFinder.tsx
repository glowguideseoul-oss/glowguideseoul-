"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import type { ClinicForCard } from "@/lib/clinics-db";

const concerns = [
  { id: "all", label: "All concerns", terms: [] },
  { id: "skin-glow", label: "Skin glow", terms: ["skin", "dermatology", "피부", "laser", "booster", "cnp", "diod"] },
  { id: "acne", label: "Acne & scars", terms: ["skin", "dermatology", "피부", "laser", "scar", "acne"] },
  { id: "anti-aging", label: "Anti-aging", terms: ["lifting", "botox", "filler", "dermatology", "피부"] },
  { id: "plastic", label: "Plastic surgery", terms: ["plastic", "surgery", "성형", "comfort"] },
  { id: "dental", label: "Dental", terms: ["dental", "teeth", "whitening", "치과"] },
];

const areas = [
  { id: "all", label: "All Seoul", terms: [] },
  { id: "gangnam", label: "Gangnam", terms: ["gangnam", "강남"] },
  { id: "apgujeong", label: "Apgujeong", terms: ["apgujeong", "압구정"] },
  { id: "sinsa", label: "Sinsa", terms: ["sinsa", "신사"] },
  { id: "cheongdam", label: "Cheongdam", terms: ["cheongdam", "청담"] },
  { id: "myeongdong", label: "Myeongdong", terms: ["myeongdong", "명동"] },
];


function matchesTerms(values: string[], terms: string[]) {
  if (!terms.length) return true;
  const haystack = values.join(" ").toLowerCase();
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

export default function ClinicGuideFinder({ clinics }: { clinics: ClinicForCard[] }) {
  const [activeConcern, setActiveConcern] = useState("all");
  const [activeArea, setActiveArea] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);

  const concern = concerns.find((item) => item.id === activeConcern) ?? concerns[0];
  const area = areas.find((item) => item.id === activeArea) ?? areas[0];

  useEffect(() => { setVisibleCount(5); }, [activeConcern, activeArea]);

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      const searchable = [
        clinic.name,
        clinic.location,
        clinic.description,

        clinic.priceRange,
        ...clinic.categories,
        ...clinic.languages,
      ];

      const concernMatch = matchesTerms(searchable, concern.terms);
      const areaMatch = matchesTerms(searchable, area.terms);
      return concernMatch && areaMatch;
    });
  }, [activeConcern, activeArea, concern.terms, area.terms]);

  const allVisible = filteredClinics.length > 0 ? filteredClinics : clinics.slice(0, 12);
  const visibleClinics = allVisible.slice(0, visibleCount);
  const hasMore = visibleCount < allVisible.length;

  return (
    <section id="clinic-finder" className="max-w-6xl mx-auto px-4 pb-20">
      <div className="glass-panel rounded-[34px] p-5 md:p-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral-light px-3 py-1.5 text-xs font-semibold text-coral-dark">
              <SlidersHorizontal size={14} />
              Clinic guide finder
            </div>
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Browse by concern and Seoul area
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Start with what travelers actually ask: treatment concern, neighborhood, and language support.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
          <div className="rounded-[28px] border border-border bg-white/60 p-4">
            <FilterGroup
              title="Concern"
              items={concerns}
              activeId={activeConcern}
              onSelect={setActiveConcern}
            />
            <FilterGroup
              title="Area"
              items={areas}
              activeId={activeArea}
              onSelect={setActiveArea}
            />
          </div>

          <div className="rounded-[28px] border border-border bg-milk/75 p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <Search size={16} className="text-jade-dark" />
                {filteredClinics.length > 0
                  ? `${filteredClinics.length} matching guides`
                  : "No exact match yet"}
              </div>
              <span className="self-start rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-muted">
                {concern.label} · {area.label}
              </span>
            </div>

            {filteredClinics.length === 0 && (
              <p className="mb-4 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                Exact matches are still being reviewed. Showing nearby clinic guide drafts instead.
              </p>
            )}

            <div className="grid gap-3">
              {visibleClinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/clinics/${clinic.id}`}
                  className="group rounded-[24px] border border-border bg-white/75 p-4 transition hover:-translate-y-0.5 hover:border-jade/40 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-jade-light px-2.5 py-1 text-xs font-semibold text-jade-dark">
                          {clinic.categories[0] ?? "Clinic Guide"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                          <MapPin size={13} />
                          {clinic.location}
                        </span>
                        {clinic.rating != null && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {clinic.rating.toFixed(1)}
                            {clinic.reviewCount != null && (
                              <span className="font-normal text-muted">({clinic.reviewCount.toLocaleString()})</span>
                            )}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-ink">{clinic.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                        {clinic.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {clinic.languages.map((language) => (
                          <span
                            key={language}
                            className="rounded-full border border-border bg-milk px-2 py-1 text-[11px] font-semibold text-soft"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-coral-dark">
                        View guide
                        <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => setVisibleCount((n) => n + 5)}
                className="mt-4 w-full rounded-full border border-border bg-white/70 py-2.5 text-sm font-semibold text-muted hover:border-jade/40 hover:text-ink transition-colors"
              >
                Load 5 more · {allVisible.length - visibleCount} remaining
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  title,
  items,
  activeId,
  onSelect,
  compact = false,
}: {
  title: string;
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <div className={compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-2"}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`rounded-full border px-3 py-2 text-left text-xs font-semibold transition ${
              activeId === item.id
                ? "border-jade bg-jade text-white shadow-sm"
                : "border-border bg-white/70 text-soft hover:border-jade/40 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
