import Link from "next/link";
import { ArrowRight, Languages, MapPin, Sparkles } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
}

export default function ClinicCard({ clinic }: { clinic: Clinic }) {
  return (
    <div className="soft-card rounded-[30px] overflow-hidden transition-transform hover:-translate-y-1">
      {/* Image — empty slot CTA */}
      <Link href="/for-clinics" className="group/img block relative h-44 overflow-hidden rounded-[24px] mx-3 mt-3 bg-border/40 border-2 border-dashed border-border hover:border-coral/40 transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
          <span className="text-2xl">📸</span>
          <p className="text-xs font-semibold text-ink">이 자리 비어있어요.</p>
          <p className="text-xs text-muted leading-snug">원하는 이미지를 올려드립니다.<br />병원 관계자분 연락주세요.</p>
          <span className="mt-1 inline-flex items-center gap-1 bg-coral text-white text-xs font-semibold rounded-full px-3 py-1.5 group-hover/img:bg-coral-dark transition-colors">
            문의하기 →
          </span>
        </div>
      </Link>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            {clinic.sponsored && (
              <span className="inline-block text-xs font-semibold bg-coral-light text-coral-dark rounded-full px-3 py-1 mb-2">
                Sponsored Clinic Guide
              </span>
            )}
            <h3 className="font-semibold text-ink text-base">{clinic.name}</h3>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted text-sm mb-3">
          <MapPin size={13} className="text-jade-dark" />
          <span>{clinic.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">{clinic.description}</p>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-3">
          <Languages size={13} className="text-jade-dark" />
          <div className="flex gap-1.5 flex-wrap">
            {clinic.languages.map((lang) => (
              <span key={lang} className="text-xs bg-jade-light text-jade-dark rounded-full px-2.5 py-1 border border-jade/10 font-medium">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {clinic.categories.map((cat) => (
            <span key={cat} className="text-xs text-muted bg-white/60 rounded-full px-2.5 py-1 border border-border">
              {cat}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0 text-sm font-semibold leading-snug text-jade-dark">{clinic.priceRange}</span>
          <Link
            href={`/clinics/${clinic.id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-jade-dark sm:w-auto"
          >
            View guide
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
