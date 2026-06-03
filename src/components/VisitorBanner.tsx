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
  US: "USA", JP: "Japan", KR: "Korea", CN: "China", TH: "Thailand",
  SG: "Singapore", AU: "Australia", GB: "UK", MY: "Malaysia", TW: "Taiwan",
  HK: "Hong Kong", PH: "Philippines", VN: "Vietnam", ID: "Indonesia", AE: "UAE",
  CA: "Canada", DE: "Germany", FR: "France", BR: "Brazil", IN: "India",
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
          🌍 {totalCountries} countries · {totalVisits.toLocaleString()} visits
        </span>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {sorted.map(([code, count]) => (
            <span key={code} className="flex items-center gap-1.5">
              <span>{flag(code)}</span>
              <span className="hidden sm:inline text-white/50">{COUNTRY_NAMES[code] ?? code}</span>
              <span className="text-white/35">{count.toLocaleString()}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
