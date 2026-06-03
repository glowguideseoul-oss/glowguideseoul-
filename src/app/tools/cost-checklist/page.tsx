import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost Checklist",
  description: "Understand the full cost of your Seoul clinic visit — consultation fees, treatment, medication, and extras.",
  openGraph: { url: "https://glowguideseoul.com/tools/cost-checklist" },
};

import Navbar from "@/components/Navbar";
import { Info } from "lucide-react";

const items = [
  { category: "Consultation", items: [
    { label: "Initial consultation fee", note: "₩20,000–₩50,000 · sometimes waived if you proceed", included: true },
    { label: "Skin analysis or test", note: "May be charged separately", included: false },
  ]},
  { category: "Procedure", items: [
    { label: "Procedure cost", note: "Ask for written quote before starting", included: true },
    { label: "Anesthesia / numbing cream", note: "Usually included, confirm beforehand", included: true },
    { label: "Additional area or session", note: "Charged per area — clarify upfront", included: false },
  ]},
  { category: "Tax & Extras", items: [
    { label: "VAT (10%)", note: "Usually included in quoted price", included: true },
    { label: "Medical tax refund (VAT refund)", note: "Available for tourists at some clinics", included: false },
    { label: "Prescribed skincare / medication", note: "Not always included — ask", included: false },
    { label: "Follow-up visit", note: "Sometimes free within 1–2 weeks", included: false },
  ]},
  { category: "Payment Methods", items: [
    { label: "Credit card (Visa/Mastercard)", note: "Accepted at most clinics", included: true },
    { label: "Cash (Korean Won)", note: "May get small discount", included: true },
    { label: "Foreign card surcharge", note: "Some clinics add 1–3%", included: false },
  ]},
];

export default function CostChecklistPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">Before Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Cost Checklist</h1>
          <p className="text-muted text-sm">Know what to expect before your appointment.</p>
        </div>

        <div className="space-y-4">
          {items.map((section) => (
            <div key={section.category} className="bg-white rounded-[28px] border border-border p-6">
              <h2 className="font-semibold text-ink mb-4">{section.category}</h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 mt-0.5 ${item.included ? "bg-coral-light text-coral" : "bg-warm border border-border text-muted"}`}>
                      {item.included ? "Usually included" : "Ask clinic"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-coral-light rounded-[28px] p-5 flex gap-3">
          <Info size={16} className="text-coral shrink-0 mt-0.5" />
          <p className="text-sm text-ink/80">
            Always ask for a written cost breakdown before proceeding. Reputable clinics will provide this without hesitation.
          </p>
        </div>
      </div>
    </div>
  );
}
