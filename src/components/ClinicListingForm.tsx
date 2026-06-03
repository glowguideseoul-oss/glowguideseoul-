"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const languages = [
  { kr: "영어", en: "English" },
  { kr: "일본어", en: "Japanese" },
  { kr: "중국어", en: "Chinese" },
  { kr: "태국어", en: "Thai" },
  { kr: "아랍어", en: "Arabic" },
];

export default function ClinicListingForm() {
  const [clinicName, setClinicName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleLang(lang: string) {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await getSupabase().from("clinic_listing_inquiries").insert({
      clinic_name: clinicName,
      contact_person: contactPerson || null,
      email,
      location_label: location || null,
      supported_languages: selectedLangs.join(", ") || null,
      monthly_budget_range: null,
      message: message || null,
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-coral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-coral-dark" />
        </div>
        <h3 className="font-serif text-2xl text-ink mb-2">문의가 접수됐습니다</h3>
        <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
          영업일 기준 2일 내에 연락드릴게요.<br />
          We'll get back to you within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: "병원명", labelEn: "Clinic name", value: clinicName, onChange: setClinicName, required: true, placeholder: "강남 스킨 스튜디오 / Seoul Skin Studio" },
        { label: "담당자 이름", labelEn: "Contact person", value: contactPerson, onChange: setContactPerson, required: false, placeholder: "홍길동 / Your name" },
        { label: "이메일", labelEn: "Email", value: email, onChange: setEmail, required: true, placeholder: "contact@clinic.co.kr", type: "email" },
        { label: "병원 위치", labelEn: "Location", value: location, onChange: setLocation, required: false, placeholder: "서울 강남구 / Gangnam, Seoul" },
      ].map((field) => (
        <div key={field.label}>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {field.label} <span className="text-muted font-normal">/ {field.labelEn}</span>
          </label>
          <input
            type={field.type || "text"}
            required={field.required}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full border border-border rounded-2xl px-5 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          외국인 환자 응대 가능 언어 <span className="text-muted font-normal">/ Supported languages</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.en}
              type="button"
              onClick={() => toggleLang(lang.en)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all ${
                selectedLangs.includes(lang.en)
                  ? "bg-coral text-white border-coral"
                  : "bg-warm border-border text-muted hover:border-coral-light"
              }`}
            >
              {lang.kr} <span className="opacity-60">/ {lang.en}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          추가 문의사항 <span className="text-muted font-normal">/ Message (optional)</span>
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="병원 소개나 궁금한 점을 자유롭게 적어주세요. / Tell us about your clinic and what you're looking for."
          className="w-full border border-border rounded-2xl px-5 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-warm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-coral text-white rounded-full py-3.5 font-semibold hover:bg-coral-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "보내는 중…" : "문의 보내기 · Submit inquiry"}
      </button>

      <p className="text-xs text-muted text-center">
        Seoul Glow Guide provides travel preparation support only. Not a medical referral service.
      </p>
    </form>
  );
}
