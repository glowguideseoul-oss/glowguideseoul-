"use client";

import { useState } from "react";
import { X, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface Props {
  clinicName: string;
  onClose: () => void;
}

export default function AppointmentModal({ clinicName, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [appointmentWindow, setAppointmentWindow] = useState("");
  const [treatment, setTreatment] = useState("");
  const [noFlightYet, setNoFlightYet] = useState(false);
  const [language, setLanguage] = useState("English");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiry_type: "clinic-appointment",
        clinic_name: clinicName,
        treatment_interest: treatment || null,
        preferred_language: language,
        budget_range: budget || null,
        arrival_date: noFlightYet ? null : (arrival || null),
        departure_date: noFlightYet ? null : (departure || null),
        notes: [
          name && `Name: ${name}`,
          country && `Country: ${country}`,
          email && `Email: ${email}`,
          noFlightYet ? "Flights: not booked yet" : (appointmentWindow && `Preferred window: ${appointmentWindow}`),
          notes,
        ].filter(Boolean).join("\n") || null,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-muted mb-1">Appointment request</p>
              <h2 className="font-serif text-2xl text-ink">{clinicName}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-warm border border-border text-muted hover:text-ink">
              <X size={15} />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-coral-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane size={24} className="text-coral" />
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">Request sent!</h3>
              <p className="text-muted text-sm leading-relaxed">
                We'll forward your inquiry to {clinicName} and follow up within 2 business days.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-coral text-white rounded-full px-7 py-3 text-sm font-semibold hover:bg-coral-dark transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 bg-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Country</label>
                  <input
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Japan"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 bg-warm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 bg-warm"
                />
              </div>

              <div className="bg-warm rounded-[20px] border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Plane size={13} className="text-coral" />
                    Korea visit schedule
                  </p>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noFlightYet}
                      onChange={(e) => {
                        setNoFlightYet(e.target.checked);
                        if (e.target.checked) { setArrival(""); setDeparture(""); }
                      }}
                      className="w-3.5 h-3.5 accent-coral rounded"
                    />
                    <span className="text-xs text-muted">Don't have flights yet</span>
                  </label>
                </div>
                {!noFlightYet && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-muted mb-1.5 flex items-center gap-1">
                      <PlaneLanding size={11} /> Arrival
                    </label>
                    <input
                      type="date"
                      value={arrival}
                      onChange={(e) => setArrival(e.target.value)}
                      className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5 flex items-center gap-1">
                      <PlaneTakeoff size={11} /> Departure
                    </label>
                    <input
                      type="date"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
                    />
                  </div>
                </div>
                )}
                <div>
                  <label className="block text-xs text-muted mb-1.5">Preferred appointment window</label>
                  <select
                    value={appointmentWindow}
                    onChange={(e) => setAppointmentWindow(e.target.value)}
                    className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
                  >
                    <option value="">Select preference</option>
                    <option>First day of arrival</option>
                    <option>Middle of stay</option>
                    <option>Last full day before departure</option>
                    <option>Flexible — clinic decides</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Treatment interest</label>
                <select
                  required
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30"
                >
                  <option value="">Select treatment</option>
                  <option>Skin Booster / Hydration</option>
                  <option>Laser / Pigmentation</option>
                  <option>Botox / Filler</option>
                  <option>Lifting / Thread</option>
                  <option>Whitening / Brightening</option>
                  <option>Hair Removal</option>
                  <option>General consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Preferred language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30"
                  >
                    <option>English</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>Thai</option>
                    <option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Budget range</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30"
                  >
                    <option value="">Select…</option>
                    <option>Under $200</option>
                    <option>$200 – $500</option>
                    <option>$500 – $1,000</option>
                    <option>$1,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies, medications, skin concerns, or anything the clinic should know..."
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 bg-warm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral text-white rounded-full py-3.5 font-semibold hover:bg-coral-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send appointment request"}
              </button>
              <p className="text-xs text-muted text-center">
                This is a consultation inquiry, not a confirmed booking.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
