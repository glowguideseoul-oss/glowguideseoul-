"use client";

import { useState } from "react";
import { MapPin, Languages, ArrowRight, CheckCircle2 } from "lucide-react";
import AppointmentModal from "@/components/AppointmentModal";

interface Clinic {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
  foreignerSupport: string;
  beforeChecklist: string[];
  aftercareNotes: string;
}

export default function ClinicDetailClient({ clinic }: { clinic: Clinic }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header card */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          {clinic.sponsored && (
            <span className="inline-block text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1 mb-4">
              Sponsored Clinic Guide
            </span>
          )}

          {/* Image placeholder */}
          <div className="h-48 bg-coral-light rounded-[20px] flex items-center justify-center mb-5">
            <span className="text-coral text-5xl">✦</span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-2">{clinic.name}</h1>

          <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
            <MapPin size={14} />
            <span>{clinic.location}</span>
          </div>

          <p className="text-muted text-sm leading-relaxed mb-5">{clinic.description}</p>

          {/* Languages */}
          <div className="flex items-center gap-2 mb-4">
            <Languages size={15} className="text-muted" />
            <div className="flex gap-2 flex-wrap">
              {clinic.languages.map((lang) => (
                <span key={lang} className="text-xs bg-warm border border-border text-muted rounded-full px-3 py-1">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-5">
            {clinic.categories.map((cat) => (
              <span key={cat} className="text-xs bg-coral-light text-coral rounded-full px-3 py-1">
                {cat}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold leading-snug text-ink sm:text-base">{clinic.priceRange}</span>
            <button
              onClick={() => setShowModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark sm:w-auto"
            >
              Request appointment
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Foreigner support */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-3">Foreigner support</h2>
          <p className="text-sm text-muted leading-relaxed">{clinic.foreignerSupport}</p>
        </div>

        {/* Before visit checklist */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-4">Before your visit</h2>
          <ul className="space-y-3">
            {clinic.beforeChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="text-coral mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Aftercare */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-3">Aftercare notes</h2>
          <p className="text-sm text-muted leading-relaxed">{clinic.aftercareNotes}</p>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-coral text-white rounded-full py-4 font-semibold hover:bg-coral-dark transition-colors shadow-lg"
          >
            Request appointment
          </button>
        </div>

        <p className="text-xs text-muted text-center mt-6 px-4">
          Seoul Glow Guide provides travel and appointment preparation support only.
          This is not medical advice. Please consult licensed medical professionals before making medical decisions.
        </p>
      </div>

      {showModal && (
        <AppointmentModal
          clinicName={clinic.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
