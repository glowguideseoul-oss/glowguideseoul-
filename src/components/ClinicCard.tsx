import Link from "next/link";
import { ArrowRight, Languages, MapPin, Star } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
  rating: number | null;
  reviewCount: number | null;
  photoReferences: string[];
  source: string | null;
}

export default function ClinicCard({ clinic }: { clinic: Clinic }) {
  const firstPhoto = clinic.photoReferences?.[0];

  return (
    <div className="soft-card rounded-[30px] overflow-hidden transition-transform hover:-translate-y-1">
      {/* Photo */}
      <div className="relative h-44 overflow-hidden rounded-[24px] mx-3 mt-3 bg-border/40">
        {firstPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/place-photo?ref=${firstPhoto}&w=600`}
            alt={clinic.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Link href="/for-clinics" className="group/img block w-full h-full border-2 border-dashed border-border hover:border-coral/40 transition-colors rounded-[24px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
              <span className="text-2xl">📸</span>
              <p className="text-xs font-semibold text-ink">Add your clinic photos</p>
              <p className="text-xs text-muted leading-snug">Clinic owners — contact us to update.</p>
              <span className="mt-1 inline-flex items-center gap-1 bg-coral text-white text-xs font-semibold rounded-full px-3 py-1.5 group-hover/img:bg-coral-dark transition-colors">
                Contact us →
              </span>
            </div>
          </Link>
        )}

        {clinic.source === "google_places" && (
          <span className="absolute bottom-2 right-2 bg-white/90 text-[10px] text-muted rounded-full px-2 py-0.5 font-medium">
            via Google
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            {clinic.sponsored && (
              <span className="inline-block text-xs font-semibold bg-coral-light text-coral-dark rounded-full px-3 py-1 mb-2">
                Sponsored Clinic Guide
              </span>
            )}
            <h3 className="font-semibold text-ink text-base leading-snug">{clinic.name}</h3>
          </div>
        </div>

        {/* Rating */}
        {clinic.rating != null && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-ink">{clinic.rating.toFixed(1)}</span>
            {clinic.reviewCount != null && (
              <span className="text-xs text-muted">({clinic.reviewCount.toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-muted text-sm mb-3">
          <MapPin size={13} className="text-jade-dark" />
          <span>{clinic.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">{clinic.description}</p>

        {/* Languages */}
        {clinic.languages.length > 0 && (
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
        )}

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
