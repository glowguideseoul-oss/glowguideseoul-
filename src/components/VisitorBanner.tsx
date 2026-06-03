"use client";

import { useEffect } from "react";

interface Props {
  totalVisits: number;
  countryCounts: Record<string, number>;
}

function flag(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "미국", JP: "일본", KR: "한국", CN: "중국", TH: "태국",
  SG: "싱가포르", AU: "호주", GB: "영국", MY: "말레이시아", TW: "대만",
  HK: "홍콩", PH: "필리핀", VN: "베트남", ID: "인도네시아", AE: "UAE",
  CA: "캐나다", DE: "독일", FR: "프랑스", BR: "브라질", IN: "인도",
};

export default function VisitorBanner({ totalVisits, countryCounts }: Props) {
  useEffect(() => {
    fetch("/api/track", { method: "POST" }).catch(() => {});
  }, []);

  if (totalVisits === 0) return null;

  const sorted = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const totalCountries = Object.keys(countryCounts).length;

  return (
    <div className="w-full bg-ink text-white/80 text-xs py-2 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap justify-center sm:justify-between">
        <span className="font-medium text-white/60 shrink-0">
          🌍 {totalCountries}개국 · {totalVisits.toLocaleString()}명 방문
        </span>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {sorted.map(([code, count]) => (
            <span key={code} className="flex items-center gap-1.5">
              <span>{flag(code)}</span>
              <span className="hidden sm:inline text-white/50">{COUNTRY_NAMES[code] ?? code}</span>
              <span className="text-white/35">{count.toLocaleString()}명</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
