import Navbar from "@/components/Navbar";
import { CheckCircle2, AlertCircle } from "lucide-react";

const checklist = [
  { section: "Before paying", items: [
    { text: "Get a written cost breakdown", important: true },
    { text: "Confirm VAT is included in the price", important: false },
    { text: "Ask if foreign card surcharge applies", important: false },
    { text: "Check if tax refund (환급) is available", important: false },
  ]},
  { section: "Payment methods", items: [
    { text: "Visa / Mastercard — accepted at most clinics", important: false },
    { text: "Cash in Korean Won — may offer small discount", important: false },
    { text: "Kakao Pay / Naver Pay — not for foreign cards", important: false },
    { text: "Amex — not widely accepted", important: false },
  ]},
  { section: "After paying", items: [
    { text: "Request an official receipt (영수증)", important: true },
    { text: "Ask for an itemized receipt if possible", important: false },
    { text: "Save receipt for tax refund or insurance claim", important: false },
    { text: "Check if follow-up visit cost is included", important: false },
  ]},
];

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">During Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Payment Checklist</h1>
          <p className="text-muted text-sm">Avoid surprises at checkout.</p>
        </div>

        <div className="space-y-4">
          {checklist.map((section) => (
            <div key={section.section} className="bg-white rounded-[28px] border border-border p-6">
              <h2 className="font-semibold text-ink mb-4">{section.section}</h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    {item.important ? (
                      <AlertCircle size={16} className="text-coral mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 size={16} className="text-muted mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${item.important ? "text-ink font-medium" : "text-muted"}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Useful phrases */}
        <div className="mt-5 bg-white rounded-[28px] border border-border p-6">
          <h2 className="font-semibold text-ink mb-4">Useful phrases</h2>
          <div className="space-y-3">
            {[
              { kr: "영수증 주세요", en: "Please give me a receipt" },
              { kr: "카드로 할게요", en: "I'll pay by card" },
              { kr: "세금 환급 되나요?", en: "Is tax refund available?" },
              { kr: "총 얼마예요?", en: "How much is the total?" },
            ].map((phrase) => (
              <div key={phrase.en} className="flex items-center justify-between bg-warm rounded-2xl p-3.5 border border-border">
                <div>
                  <p className="text-sm font-medium text-ink">{phrase.kr}</p>
                  <p className="text-xs text-coral">{phrase.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
