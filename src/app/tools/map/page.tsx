import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinic Trip Map",
  description: "Navigate your Seoul clinic visit step by step — from hotel to clinic, pharmacy, and back.",
  openGraph: { url: "https://glowguideseoul.com/tools/map" },
};

import Navbar from "@/components/Navbar";
import { clinics } from "@/lib/mock-data";
import Link from "next/link";
import { MapPin, Train, ArrowRight } from "lucide-react";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">During Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Clinic Trip Map</h1>
          <p className="text-muted text-sm">Location and transport guide for your clinic.</p>
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-[28px] border border-border overflow-hidden mb-5">
          <div className="h-52 bg-gradient-to-br from-coral-light to-border flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-coral mx-auto mb-2" />
              <p className="text-sm text-muted">Map view</p>
              <p className="text-xs text-muted/60">Gangnam · Apgujeong · Myeongdong</p>
            </div>
          </div>
          <div className="p-5">
            <p className="text-xs text-muted">Interactive map coming soon. Use clinic address cards below to navigate.</p>
          </div>
        </div>

        {/* Clinic list */}
        <div className="space-y-4">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-[28px] border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-ink">{clinic.name}</h3>
                  <div className="flex items-center gap-1 text-muted text-sm mt-1">
                    <MapPin size={13} />
                    <span>{clinic.location}</span>
                  </div>
                </div>
                {clinic.sponsored && (
                  <span className="text-xs bg-coral-light text-coral rounded-full px-2.5 py-0.5">Sponsored</span>
                )}
              </div>

              <div className="flex items-start gap-2 bg-warm rounded-2xl p-3 border border-border mb-3">
                <Train size={14} className="text-coral mt-0.5 shrink-0" />
                <p className="text-xs text-muted">5 min walk from nearest subway station · Taxi recommended from airport</p>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/tools/taxi"
                  className="flex-1 text-center text-sm border border-border rounded-full py-2 text-muted hover:border-coral hover:text-coral transition-colors"
                >
                  Taxi card
                </Link>
                <Link
                  href={`/clinics/${clinic.id}`}
                  className="flex-1 flex items-center justify-center gap-1 text-sm bg-coral text-white rounded-full py-2 hover:bg-coral-dark transition-colors"
                >
                  Clinic guide <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
