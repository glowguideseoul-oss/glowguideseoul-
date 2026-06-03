import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinic Phrasebook",
  description: "Korean phrases for your clinic visit — greetings, questions to ask, and aftercare communication, translated for Seoul clinics.",
  openGraph: { url: "https://glowguideseoul.com/tools/phrasebook" },
};

import Navbar from "@/components/Navbar";
import { phrasebook } from "@/lib/mock-data";
import { Volume2 } from "lucide-react";

const sections = [
  { key: "reception" as const, label: "At Reception", emoji: "🏥" },
  { key: "payment" as const, label: "Payment", emoji: "💳" },
  { key: "medical" as const, label: "Medical", emoji: "🩺" },
];

export default function PhrasebookPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">During Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Clinic Phrasebook</h1>
          <p className="text-muted text-sm">Key phrases for your clinic visit — tap to highlight.</p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.key} className="bg-white rounded-[28px] border border-border p-6">
              <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
                <span>{section.emoji}</span>
                {section.label}
              </h2>
              <div className="space-y-3">
                {phrasebook[section.key].map((phrase) => (
                  <div key={phrase.en} className="bg-warm rounded-2xl p-4 border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-ink mb-1">{phrase.kr}</p>
                        <p className="text-xs text-muted mb-1">{phrase.romanized}</p>
                        <p className="text-sm text-coral">{phrase.en}</p>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center bg-coral-light rounded-full shrink-0">
                        <Volume2 size={14} className="text-coral" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted text-center mt-8">
          Show this screen to clinic staff if needed.
        </p>
      </div>
    </div>
  );
}
