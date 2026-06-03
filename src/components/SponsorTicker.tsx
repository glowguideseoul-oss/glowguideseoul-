"use client";

const items = [
  { label: "파트너 클리닉 모집 중", accent: true },
  { label: "Reach global beauty travelers", accent: false },
  { label: "외국인 환자에게 직접 노출", accent: false },
  { label: "Featured clinic spots available", accent: true },
  { label: "일본 · 영어 · 중국어 사용자 대상", accent: false },
  { label: "Partner with Seoul Glow Guide", accent: false },
  { label: "지금 스폰서십 문의하기", accent: true },
  { label: "Promote your clinic worldwide", accent: false },
];

const repeated = [...items, ...items, ...items];

export default function SponsorTicker() {
  return (
    <div className="relative w-full overflow-hidden bg-[#1a1714] py-3">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#1a1714] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#1a1714] to-transparent" />

      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6">
            {item.accent ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-coral/15 border border-coral/25 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-coral">
                <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
                {item.label}
              </span>
            ) : (
              <span className="text-[11px] font-medium tracking-wide text-white/40">
                {item.label}
              </span>
            )}
            <span className="text-white/15 text-xs">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
