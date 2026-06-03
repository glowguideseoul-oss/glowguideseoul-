import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taxi Address Card",
  description: "Korean address cards for your Seoul clinic visit. Show your driver the destination in Korean — no language barrier.",
  openGraph: { url: "https://glowguideseoul.com/tools/taxi" },
};

import Navbar from "@/components/Navbar";
import { taxiCards } from "@/lib/mock-data";
import { MapPin, Copy } from "lucide-react";

export default function TaxiPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">During Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Taxi Address Card</h1>
          <p className="text-muted text-sm">Show this to your driver — no Korean needed.</p>
        </div>

        <div className="space-y-5">
          {taxiCards.map((card) => (
            <div key={card.clinicName} className="bg-white rounded-[28px] border border-border overflow-hidden">
              {/* Korean address — large, easy to show driver */}
              <div className="bg-ink p-6 text-center">
                <p className="text-white/60 text-xs mb-2">목적지 / Destination</p>
                <p className="text-white font-semibold text-xl leading-snug mb-1">{card.clinicName}</p>
                <p className="text-white text-lg">{card.address}</p>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-coral mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-ink">{card.addressEn}</p>
                    <p className="text-xs text-muted mt-1">{card.noteEn}</p>
                  </div>
                </div>

                <div className="bg-warm rounded-2xl p-3 border border-border">
                  <p className="text-xs text-muted mb-1">Korean note for driver</p>
                  <p className="text-sm text-ink">{card.note}</p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 border border-border rounded-full py-2.5 text-sm text-muted hover:border-coral hover:text-coral transition-colors">
                  <Copy size={14} />
                  Copy Korean address
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-coral-light rounded-[28px] p-5">
          <p className="text-sm text-coral font-medium mb-1">Tip</p>
          <p className="text-sm text-ink/70">
            Save a screenshot of this page before heading out — works offline too.
          </p>
        </div>
      </div>
    </div>
  );
}
