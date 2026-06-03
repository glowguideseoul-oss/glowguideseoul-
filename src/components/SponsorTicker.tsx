"use client";

const items = [
  "✦ 파트너 클리닉 모집 중",
  "✦ Partner with Seoul Glow Guide",
  "✦ 외국인 환자에게 직접 노출되는 기회",
  "✦ Reach international beauty travelers",
  "✦ glowguideseoul과 함께할 스폰서(병/의원)을 모십니다.",
  "✦ Featured clinic spots available",
  "✦ 일본 · 영어 · 중국어 사용자 대상",
  "✦ Promote your clinic to global visitors",
];

const repeated = [...items, ...items];

export default function SponsorTicker() {
  return (
    <a
      href="/for-clinics#advertise"
      className="block w-full overflow-hidden bg-ink border-y border-ink/10 py-2.5 select-none cursor-pointer hover:bg-ink/90 transition-colors group"
    >
      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-8 text-xs font-semibold tracking-wide text-white/80 group-hover:text-white transition-colors"
          >
            {text}
          </span>
        ))}
      </div>
    </a>
  );
}
