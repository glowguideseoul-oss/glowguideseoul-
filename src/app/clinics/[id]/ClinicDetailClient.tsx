"use client";

import { useState } from "react";
import { MapPin, Languages, ArrowRight, CheckCircle2, Star, Clock, Globe, Phone, ExternalLink } from "lucide-react";
import AppointmentModal from "@/components/AppointmentModal";
import type { GoogleReview, OpeningHours } from "@/lib/clinics-db";

interface Clinic {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
  foreignerSupport: string;
  beforeChecklist: string[];
  aftercareNotes: string;
  rating: number | null;
  reviewCount: number | null;
  photoReferences: string[];
  source: string | null;
  reviews: GoogleReview[];
  openingHours: OpeningHours | null;
  googleMapsUrl: string | null;
  phone: string | null;
  websiteUrl: string | null;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-border fill-border"}
        />
      ))}
    </div>
  );
}

export default function ClinicDetailClient({ clinic }: { clinic: Clinic }) {
  const [showModal, setShowModal] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = clinic.photoReferences ?? [];

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header card */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          {clinic.sponsored && (
            <span className="inline-block text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1 mb-4">
              Sponsored Clinic Guide
            </span>
          )}

          {/* Photo gallery */}
          {photos.length > 0 ? (
            <div className="mb-5">
              <div className="h-56 rounded-[20px] overflow-hidden bg-border/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/place-photo?ref=${photos[activePhoto]}&w=800`}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {photos.map((ref, i) => (
                    <button
                      key={ref}
                      onClick={() => setActivePhoto(i)}
                      className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === activePhoto ? "border-jade" : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/place-photo?ref=${ref}&w=100`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
              {clinic.source === "google_places" && (
                <p className="text-[10px] text-muted mt-1.5 text-right">Photos via Google Maps</p>
              )}
            </div>
          ) : (
            <div className="h-48 bg-coral-light rounded-[20px] flex items-center justify-center mb-5">
              <span className="text-coral text-5xl">✦</span>
            </div>
          )}

          <h1 className="font-serif text-3xl text-ink mb-2">{clinic.name}</h1>

          {/* Rating */}
          {clinic.rating != null && (
            <div className="flex items-center gap-2 mb-3">
              <StarRow rating={clinic.rating} />
              <span className="text-sm font-semibold text-ink">{clinic.rating.toFixed(1)}</span>
              {clinic.reviewCount != null && (
                <span className="text-xs text-muted">{clinic.reviewCount.toLocaleString()} Google reviews</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
            <MapPin size={14} />
            <span>{clinic.location}</span>
          </div>

          <p className="text-muted text-sm leading-relaxed mb-5">{clinic.description}</p>

          {/* Contact info */}
          {(clinic.phone || clinic.websiteUrl || clinic.googleMapsUrl) && (
            <div className="space-y-2 mb-5">
              {clinic.phone && (
                <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
                  <Phone size={14} className="text-jade-dark shrink-0" />
                  <span>{clinic.phone}</span>
                </a>
              )}
              {clinic.websiteUrl && (
                <a href={clinic.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
                  <Globe size={14} className="text-jade-dark shrink-0" />
                  <span className="truncate">{clinic.websiteUrl.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              )}
              {clinic.googleMapsUrl && (
                <a href={clinic.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
                  <MapPin size={14} className="text-jade-dark shrink-0" />
                  <span>View on Google Maps</span>
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Languages */}
          {clinic.languages.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Languages size={15} className="text-muted" />
              <div className="flex gap-2 flex-wrap">
                {clinic.languages.map((lang) => (
                  <span key={lang} className="text-xs bg-warm border border-border text-muted rounded-full px-3 py-1">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-5">
            {clinic.categories.map((cat) => (
              <span key={cat} className="text-xs bg-coral-light text-coral rounded-full px-3 py-1">
                {cat}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold leading-snug text-ink sm:text-base">{clinic.priceRange}</span>
            <button
              onClick={() => setShowModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark sm:w-auto"
            >
              Request appointment
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Opening hours */}
        {clinic.openingHours?.weekday_text && clinic.openingHours.weekday_text.length > 0 && (
          <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-jade-dark" />
              <h2 className="font-semibold text-ink">Opening hours</h2>
              {clinic.openingHours.open_now != null && (
                <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-1 ${
                  clinic.openingHours.open_now
                    ? "bg-jade-light text-jade-dark"
                    : "bg-border text-muted"
                }`}>
                  {clinic.openingHours.open_now ? "Open now" : "Closed now"}
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
              {clinic.openingHours.weekday_text.map((line) => {
                const [day, ...rest] = line.split(": ");
                return (
                  <li key={line} className="flex justify-between text-sm">
                    <span className="text-ink font-medium w-28 shrink-0">{day}</span>
                    <span className="text-muted text-right">{rest.join(": ")}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Foreigner support */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-3">Foreigner support</h2>
          <p className="text-sm text-muted leading-relaxed">{clinic.foreignerSupport}</p>
        </div>

        {/* Before visit checklist */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-4">Before your visit</h2>
          <ul className="space-y-3">
            {clinic.beforeChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="text-coral mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Aftercare */}
        <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
          <h2 className="font-semibold text-ink mb-3">Aftercare notes</h2>
          <p className="text-sm text-muted leading-relaxed">{clinic.aftercareNotes}</p>
        </div>

        {/* Google Reviews */}
        {clinic.reviews.length > 0 && (
          <div className="bg-white rounded-[28px] border border-border p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Patient reviews</h2>
              <span className="text-xs text-muted">via Google Maps</span>
            </div>
            <div className="space-y-5">
              {clinic.reviews.map((review, i) => (
                <div key={i} className={i < clinic.reviews.length - 1 ? "pb-5 border-b border-border" : ""}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink">{review.author}</span>
                    <span className="text-xs text-muted">{review.time}</span>
                  </div>
                  <StarRow rating={review.rating} />
                  {review.text && (
                    <p className="text-sm text-muted leading-relaxed mt-2 line-clamp-4">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
            {clinic.googleMapsUrl && (
              <a
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1.5 text-xs text-jade-dark font-medium hover:underline"
              >
                See all reviews on Google Maps
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}

        {/* Google attribution */}
        {clinic.source === "google_places" && (
          <div className="flex items-center justify-center gap-2 mb-5 text-xs text-muted">
            <span>Clinic information sourced from</span>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink hover:underline"
            >
              Google Maps
            </a>
          </div>
        )}

        {/* Sticky CTA */}
        <div className="sticky bottom-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-coral text-white rounded-full py-4 font-semibold hover:bg-coral-dark transition-colors shadow-lg"
          >
            Request appointment
          </button>
        </div>

        <p className="text-xs text-muted text-center mt-6 px-4">
          Seoul Glow Guide provides travel and appointment preparation support only.
          This is not medical advice. Please consult licensed medical professionals before making medical decisions.
        </p>
      </div>

      {showModal && (
        <AppointmentModal
          clinicName={clinic.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
