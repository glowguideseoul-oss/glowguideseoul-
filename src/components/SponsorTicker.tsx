"use client";

const items = [
  "✦ 파트너 클리닉 모집 중",
  "✦ Partner with Seoul Glow Guide",
  "✦ 외국인 환자에게 직접 노출되는 기회",
  "✦ Reach international beauty travelers",
  "✦ 지금 스폰서십 문의하기 →",
  "✦ Featured clinic spots available",
  "✦ 일본 · 영어 · 중국어 사용자 대상",
  "✦ Promote your clinic to global visitors",
];

const repeated = [...items, ...items];

export default function SponsorTicker() {
  return (
    <div className="w-full overflow-hidden bg-ink border-y border-ink/10 py-2.5 select-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-8 text-xs font-semibold tracking-wide text-white/80"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
