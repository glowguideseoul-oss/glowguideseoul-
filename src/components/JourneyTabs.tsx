"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  Pill,
  Plane,
  ShieldCheck,
} from "lucide-react";

const tabs = [
  {
    id: "before",
    label: "Before Visit",
    icon: <ClipboardList size={16} />,
    cards: [
      {
        icon: <ShieldCheck size={18} />,
        title: "Clinic Guide",
        desc: "Foreigner-ready clinic information, supported languages, and price ranges.",
        href: "#clinics",
      },
      {
        icon: <CreditCard size={18} />,
        title: "Cost Checklist",
        desc: "Check consultation, procedure, tax refund, medication, and follow-up costs.",
        href: "/tools/cost-checklist",
      },
      {
        icon: <FileText size={18} />,
        title: "Visa & Documents",
        desc: "Passport, allergy, medication, and paperwork reminders before the visit.",
        href: "/tools/consultation",
      },
      {
        icon: <ClipboardList size={18} />,
        title: "Consultation Questions",
        desc: "Questions to ask before deciding on any clinic or procedure.",
        href: "/tools/consultation",
      },
    ],
  },
  {
    id: "during",
    label: "During Visit",
    icon: <MapPin size={16} />,
    cards: [
      {
        icon: <MapPin size={18} />,
        title: "Clinic Trip Map",
        desc: "Keep clinic, hotel, pharmacy, transport, and emergency stops in one route.",
        href: "/tools/map",
      },
      {
        icon: <MessageCircle size={18} />,
        title: "Taxi Address Card",
        desc: "Show Korean address text to a taxi driver without explaining anything.",
        href: "/tools/taxi",
      },
      {
        icon: <MessageCircle size={18} />,
        title: "Clinic Phrasebook",
        desc: "Reception, consultation, payment, medication, and aftercare phrases.",
        href: "/tools/phrasebook",
      },
      {
        icon: <CreditCard size={18} />,
        title: "Payment Checklist",
        desc: "Card, cash, tax refund, exchange rate, and receipt reminders.",
        href: "/tools/payment",
      },
    ],
  },
  {
    id: "after",
    label: "Aftercare",
    icon: <Heart size={16} />,
    cards: [
      {
        icon: <Pill size={18} />,
        title: "Aftercare Checklist",
        desc: "Follow clinic instructions without losing the details after leaving.",
        href: "/tools/aftercare",
      },
      {
        icon: <MessageCircle size={18} />,
        title: "Symptom Contact Guide",
        desc: "Know when to contact the clinic and what to say.",
        href: "/tools/aftercare",
      },
      {
        icon: <Plane size={18} />,
        title: "Follow-up Template",
        desc: "Send a follow-up message after returning home.",
        href: "/tools/aftercare",
      },
    ],
  },
];

export default function JourneyTabs() {
  const [active, setActive] = useState("before");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div>
      <div className="inline-flex bg-coral-light/70 border border-coral/10 rounded-full p-1 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              active === tab.id
                ? "bg-white text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {current.cards.map((card, i) => (
          <Link
            key={card.title}
            href={card.href}
            className="group soft-card rounded-[28px] p-6 transition-all hover:-translate-y-1 hover:border-jade/30"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-jade-light text-jade-dark">
                  {card.icon}
                </span>
                <div>
                  <span className="text-[11px] font-semibold text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-ink text-sm">{card.title}</h3>
                </div>
              </div>
              <ArrowRight size={14} className="text-muted group-hover:text-jade-dark transition-colors shrink-0" />
            </div>
            <p className="text-muted text-sm leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
