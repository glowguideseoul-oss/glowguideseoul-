"use client";

import { useState } from "react";
import { X, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface Props {
  clinicName: string;
  onClose: () => void;
}

export default function AppointmentModal({ clinicName, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
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
                The clinic will review your inquiry and get back to you within 2 business days.
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
              {/* Personal */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Name</label>
                  <input
                    required
                    placeholder="Your name"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Country</label>
                  <input
                    required
                    placeholder="Japan"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  placeholder="you@email.com"
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm"
                />
              </div>

              {/* Flight schedule */}
              <div className="bg-warm rounded-[20px] border border-border p-4 space-y-3">
                <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Plane size={13} className="text-coral" />
                  Korea visit schedule
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-muted mb-1.5 flex items-center gap-1">
                      <PlaneLanding size={11} />
                      Arrival (flight in)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5 flex items-center gap-1">
                      <PlaneTakeoff size={11} />
                      Departure (flight out)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full border border-border rounded-2xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">Preferred appointment window</label>
                  <select className="w-full border border-border rounded-2xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-coral/30">
                    <option value="">Select preference</option>
                    <option>First day of arrival</option>
                    <option>Middle of stay</option>
                    <option>Last full day before departure</option>
                    <option>Flexible — clinic decides</option>
                  </select>
                </div>
              </div>

              {/* Treatment */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Treatment interest</label>
                <select required className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30">
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

              {/* Language + Budget */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Preferred language</label>
                  <select className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30">
                    <option>English</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>Thai</option>
                    <option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">Budget range</label>
                  <select className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-coral/30">
                    <option>Under $200</option>
                    <option>$200 – $500</option>
                    <option>$500 – $1,000</option>
                    <option>$1,000+</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Allergies, medications, skin concerns, or anything the clinic should know..."
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-coral text-white rounded-full py-3.5 font-semibold hover:bg-coral-dark transition-colors"
              >
                Send appointment request
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
