"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowRight,
  Sparkles,
  PlaneLanding,
  Search,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";

type Flow = "find" | "booked";
type Step = "find-form" | "clinic-inquiry" | "done";

interface Props {
  initialFlow: Flow;
  onClose: () => void;
}

const concerns = [
  { id: "skin-glow", label: "Skin glow", helper: "Dullness, hydration, brightening" },
  { id: "acne", label: "Acne & scars", helper: "Acne marks, texture, pores" },
  { id: "anti-aging", label: "Anti-aging", helper: "Lifting, elasticity, refreshed look" },
  { id: "botox-filler", label: "Botox / filler", helper: "Volume, contour, fine lines" },
  { id: "eyes", label: "Eyes", helper: "Double eyelid or eye consultation" },
  { id: "nose", label: "Nose", helper: "Nose consultation" },
  { id: "dental", label: "Dental aesthetics", helper: "Whitening, veneers, cleaning" },
  { id: "not-sure", label: "Too many options", helper: "Help me figure out where to start" },
];

const areas = [
  { id: "gangnam", label: "Gangnam", match: ["Gangnam"] },
  { id: "apgujeong", label: "Apgujeong / Sinsa", match: ["Apgujeong", "Sinsa"] },
  { id: "myeongdong", label: "Myeongdong", match: ["Myeongdong"] },
  { id: "hongdae", label: "Hongdae", match: ["Hongdae", "Mapo"] },
  { id: "jamsil", label: "Jamsil / Songpa", match: ["Jamsil", "Songpa"] },
  { id: "not-sure", label: "Not sure yet", match: [] },
];

const supportOptions = [
  { id: "EN", label: "English support" },
  { id: "JP", label: "Japanese support" },
  { id: "ZH", label: "Chinese support" },
  { id: "aftercare", label: "Aftercare support" },
  { id: "price", label: "Price range listed" },
];

const concernCategoryMap: Record<string, string[]> = {
  "skin-glow": ["Skin", "Skin Boosters", "Hydrafacial", "Laser", "Whitening"],
  acne: ["Skin", "Laser", "Hydrafacial"],
  "anti-aging": ["Lifting", "Botox", "Filler"],
  "botox-filler": ["Botox", "Filler"],
  eyes: ["Eye", "Plastic Surgery"],
  nose: ["Nose", "Plastic Surgery"],
  dental: ["Dental", "Whitening", "Veneers", "Cleaning"],
  "not-sure": [],
};

export default function StartPlanningModal({ initialFlow, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(initialFlow === "find" ? "find-form" : "clinic-inquiry");
  const [requestCount, setRequestCount] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats").then((r) => r.json()).then((d) => setRequestCount(d.count)).catch(() => {});
    fetch("/api/clinics").then((r) => r.json()).then((d) => setListedClinics(d.clinics ?? [])).catch(() => {});
  }, []);

  // find-form state
  const [concern, setConcern] = useState("");
  const [area, setArea] = useState("");
  const [support, setSupport] = useState("EN");
  const [budget, setBudget] = useState("");
  const [arrival, setArrival] = useState("");
  const [noFlightYet, setNoFlightYet] = useState(false);
  const [messenger, setMessenger] = useState("KakaoTalk");
  const [messengerId, setMessengerId] = useState("");
  const [notes, setNotes] = useState("");

  // clinic-inquiry state
  const [clinicNameFreeText, setClinicNameFreeText] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [listedClinics, setListedClinics] = useState<{ id: string; name: string; location: string }[]>([]);
  const [chipArea, setChipArea] = useState<string | null>(null);
  const [inquiryConcern, setInquiryConcern] = useState("");
  const [inquiryArrival, setInquiryArrival] = useState("");
  const [noInquiryFlightYet, setNoInquiryFlightYet] = useState(false);
  const [inquiryLanguage, setInquiryLanguage] = useState("English");
  const [inquiryMessenger, setInquiryMessenger] = useState("KakaoTalk");
  const [inquiryMessengerId, setInquiryMessengerId] = useState("");
  const [inquiryNotes, setInquiryNotes] = useState("");

  const selectedConcern = concerns.find((item) => item.id === concern);
  const selectedArea = areas.find((item) => item.id === area);
  const selectedSupport = supportOptions.find((item) => item.id === support);

  const resolvedClinicName = clinicNameFreeText;

  async function handleFindSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiry_type: "find",
        treatment_interest: selectedConcern?.label ?? null,
        area: selectedArea?.label ?? null,
        what_matters_most: selectedSupport?.label ?? null,
        budget_range: budget || null,
        arrival_date: noFlightYet ? null : (arrival || null),
        preferred_language: support,
        messenger_type: messenger,
        messenger_id: messengerId,
        notes: notes || null,
      }),
    });
    setStep("done");
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiry_type: "clinic-inquiry",
        clinic_name: resolvedClinicName || null,
        area: clinicLocation || null,
        treatment_interest: concerns.find((c) => c.id === inquiryConcern)?.label ?? null,
        arrival_date: noInquiryFlightYet ? null : (inquiryArrival || null),
        preferred_language: inquiryLanguage,
        messenger_type: inquiryMessenger,
        messenger_id: inquiryMessengerId,
        notes: inquiryNotes || null,
      }),
    });
    setStep("done");
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-jade-light text-jade-dark">
                {initialFlow === "find" ? <Search size={15} /> : <CalendarCheck size={15} />}
              </span>
              <span className="text-sm font-semibold text-ink">
                {initialFlow === "find" ? "Find my clinic" : "Check a clinic I found"}
              </span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-warm border border-border text-muted hover:text-ink">
              <X size={15} />
            </button>
          </div>

          {/* Flow: Find clinic — Concierge form */}
          {step === "find-form" && (
            <form onSubmit={handleFindSubmit} className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-ink mb-1">Not sure which treatment you need?</h2>
                <p className="text-muted text-sm mb-3">
                  Tell us what's bothering you — we'll match you with the right clinics and help you know what to ask before you fly.
                </p>
                {requestCount !== null && requestCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-jade-light px-3 py-1.5 text-xs font-semibold text-jade-dark mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-jade-dark animate-pulse" />
                    {requestCount.toLocaleString()} travelers have already requested a consultation
                  </div>
                )}
              </div>

              {/* Concern */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-2">What are you looking for?</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {concerns.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConcern(c.id)}
                      className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                        concern === c.id ? "bg-jade text-white border-jade" : "bg-warm border-border text-muted hover:border-jade/40"
                      }`}
                    >
                      <span className="block text-xs font-semibold">{c.label}</span>
                      <span className={`block text-[11px] ${concern === c.id ? "text-white/75" : "text-muted"}`}>
                        {c.helper}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-2">Where in Seoul?</label>
                <div className="flex flex-wrap gap-2">
                  {areas.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArea(item.id)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                        area === item.id ? "bg-coral text-white border-coral" : "bg-warm border-border text-muted hover:border-coral/40"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flight */}
              <div className="bg-warm rounded-[20px] border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <PlaneLanding size={12} className="text-jade-dark" />
                    Korea visit schedule
                  </p>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noFlightYet}
                      onChange={(e) => { setNoFlightYet(e.target.checked); if (e.target.checked) setArrival(""); }}
                      className="w-3.5 h-3.5 accent-jade rounded"
                    />
                    <span className="text-xs text-muted">Don't have flights yet</span>
                  </label>
                </div>
                {!noFlightYet && (
                  <div>
                    <label className="flex items-center gap-1 text-xs text-muted mb-1.5"><PlaneLanding size={11} /> Arrival to Seoul</label>
                    <input type="date" value={arrival} onChange={(e) => setArrival(e.target.value)} className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink bg-white focus:outline-none focus:ring-2 focus:ring-jade/30" />
                  </div>
                )}
              </div>

              {/* Language + Budget */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">What matters most?</label>
                  <select value={support} onChange={(e) => setSupport(e.target.value)} className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30">
                    {supportOptions.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Budget</label>
                  <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30">
                    <option value="">Select…</option>
                    <option>Under $200</option><option>$200 – $500</option><option>$500 – $1,000</option><option>$1,000+</option>
                  </select>
                </div>
              </div>

              {/* Messenger */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Preferred messenger</label>
                <div className="flex gap-2">
                  <select value={messenger} onChange={(e) => setMessenger(e.target.value)} className="border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30 shrink-0">
                    <option>KakaoTalk</option><option>LINE</option><option>WhatsApp</option>
                  </select>
                  <input
                    type="text"
                    value={messengerId}
                    onChange={(e) => setMessengerId(e.target.value)}
                    placeholder={messenger === "KakaoTalk" ? "KakaoTalk ID" : messenger === "LINE" ? "LINE ID" : "Phone number"}
                    className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-jade/30 bg-warm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Anything else? (optional)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, skin history, specific concerns..." className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-jade/30 bg-warm resize-none" />
              </div>

              <button type="submit" className="w-full bg-jade text-white rounded-full py-3.5 font-semibold hover:bg-jade-dark transition-colors">
                Find matching clinics
              </button>
              <p className="text-xs text-muted text-center">Get matched before you book anything.</p>
            </form>
          )}

          {/* Flow: Clinic inquiry — Consultation request form */}
          {step === "clinic-inquiry" && (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-ink mb-1">You already have a clinic in mind</h2>
                <p className="text-muted text-sm mb-5">
                  Tell us the clinic name and location. We'll help you prepare the right questions before your visit.
                </p>
              </div>

              {/* Clinic name + location */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink">Clinic details</label>
                <input
                  type="text"
                  value={clinicNameFreeText}
                  onChange={(e) => setClinicNameFreeText(e.target.value)}
                  placeholder="Clinic name (e.g. JK Plastic Surgery, CNP Dermatology…)"
                  className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-muted bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
                />
                <input
                  type="text"
                  value={clinicLocation}
                  onChange={(e) => setClinicLocation(e.target.value)}
                  placeholder="Location (e.g. Gangnam, Apgujeong, Hongdae…)"
                  className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-muted bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
                />
                {listedClinics.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] text-muted mb-2">Or pick from our listed clinics:</p>
                    {/* Area filter tabs */}
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      {["Gangnam", "Apgujeong", "Cheongdam", "Myeongdong", "Hongdae"].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setChipArea(chipArea === a ? null : a)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            chipArea === a
                              ? "border-coral bg-coral text-white"
                              : "border-border bg-white/70 text-muted hover:border-coral/40"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    {/* Filtered clinic chips — max 8 */}
                    <div className="flex flex-wrap gap-1.5">
                      {listedClinics
                        .filter((c) => !chipArea || c.location.toLowerCase().includes(chipArea.toLowerCase()))
                        .slice(0, 8)
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setClinicNameFreeText(c.name)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                              clinicNameFreeText === c.name
                                ? "border-jade bg-jade text-white"
                                : "border-border bg-white/70 text-muted hover:border-jade/40 hover:text-ink"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Treatment interest */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-2">What would you like to discuss?</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {concerns.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setInquiryConcern(c.id)}
                      className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                        inquiryConcern === c.id ? "bg-jade text-white border-jade" : "bg-warm border-border text-muted hover:border-jade/40"
                      }`}
                    >
                      <span className="block text-xs font-semibold">{c.label}</span>
                      <span className={`block text-[11px] ${inquiryConcern === c.id ? "text-white/75" : "text-muted"}`}>
                        {c.helper}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flight */}
              <div className="bg-warm rounded-[20px] border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <PlaneLanding size={12} className="text-jade-dark" />
                    Korea visit schedule
                  </p>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noInquiryFlightYet}
                      onChange={(e) => { setNoInquiryFlightYet(e.target.checked); if (e.target.checked) setInquiryArrival(""); }}
                      className="w-3.5 h-3.5 accent-jade rounded"
                    />
                    <span className="text-xs text-muted">Don't have flights yet</span>
                  </label>
                </div>
                {!noInquiryFlightYet && (
                  <div>
                    <label className="flex items-center gap-1 text-xs text-muted mb-1.5"><PlaneLanding size={11} /> Arrival to Seoul</label>
                    <input
                      type="date"
                      value={inquiryArrival}
                      onChange={(e) => setInquiryArrival(e.target.value)}
                      className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink bg-white focus:outline-none focus:ring-2 focus:ring-jade/30"
                    />
                  </div>
                )}
              </div>

              {/* Language + Messenger */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Language</label>
                  <select
                    value={inquiryLanguage}
                    onChange={(e) => setInquiryLanguage(e.target.value)}
                    className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
                  >
                    <option>English</option><option>Japanese</option><option>Chinese</option><option>Thai</option><option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Messenger</label>
                  <select
                    value={inquiryMessenger}
                    onChange={(e) => setInquiryMessenger(e.target.value)}
                    className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
                  >
                    <option>KakaoTalk</option><option>LINE</option><option>WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={inquiryMessengerId}
                  onChange={(e) => setInquiryMessengerId(e.target.value)}
                  placeholder={inquiryMessenger === "KakaoTalk" ? "KakaoTalk ID" : inquiryMessenger === "LINE" ? "LINE ID" : "Phone number"}
                  className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-jade/30 bg-warm"
                />
              </div>

              {/* Questions */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Questions for the clinic (optional)</label>
                <textarea
                  rows={3}
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  placeholder="Anything specific you'd like to ask or mention before your visit…"
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-jade/30 bg-warm resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-jade text-white rounded-full py-3.5 font-semibold hover:bg-jade-dark transition-colors">
                Send consultation request
              </button>
              <p className="text-xs text-muted text-center">We'll forward your request and follow up within 2 business days.</p>

              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep("find-form")}
                  className="w-full text-xs text-muted hover:text-ink transition-colors"
                >
                  Not sure yet? Get pre-visit advice →
                </button>
              </div>
            </form>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-jade-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-jade-dark" />
              </div>
              <h3 className="font-serif text-2xl text-ink mb-2">
                {initialFlow === "booked" ? "Request sent" : "We're on it"}
              </h3>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                {initialFlow === "booked" && resolvedClinicName
                  ? `We'll forward your consultation request to ${resolvedClinicName} and follow up on your messenger within 2 business days.`
                  : "A Seoul Glow concierge will reach out on your messenger to walk through your options — before you book anything."}
              </p>
              <button onClick={onClose} className="mt-6 bg-jade text-white rounded-full px-7 py-3 text-sm font-semibold hover:bg-jade-dark transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
