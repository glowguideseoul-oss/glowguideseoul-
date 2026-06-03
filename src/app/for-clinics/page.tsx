import Navbar from "@/components/Navbar";
import LogoMark from "@/components/LogoMark";
import ClinicListingForm from "@/components/ClinicListingForm";
import { ArrowRight } from "lucide-react";

export default function ForClinics() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-coral-light text-coral rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          For clinic operators
        </div>
        <h1 className="font-serif text-4xl text-ink leading-tight mb-6 sm:text-5xl">
          Reach international patients planning clinic visits in Korea
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Showcase your clinic information, supported languages, treatment categories,
          and aftercare support to medical travelers — before they even land in Seoul.
        </p>
        <a
          href="#advertise"
          className="inline-flex items-center gap-2 bg-coral text-white rounded-full px-7 py-3.5 font-semibold hover:bg-coral-dark transition-colors"
        >
          Request clinic listing
          <ArrowRight size={16} />
        </a>
      </section>

      {/* What we don't do */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl text-ink mb-4">What we don&apos;t do</h2>
        <p className="text-muted mb-6 text-sm leading-relaxed">
          Seoul Glow Guide is a travel preparation and information platform, not a medical referral service.
          We do not rank clinics, guarantee results, or sell patient leads.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "No 'Best clinic' rankings",
            "No result guarantees",
            "No patient lead selling",
            "No review manipulation",
            "No before/after ad products",
          ].map((item) => (
            <span key={item} className="text-sm bg-white border border-border text-muted rounded-full px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section id="advertise" className="bg-white border-y border-border py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-ink mb-1">클리닉 등록 문의</h2>
            <p className="text-muted text-xs mb-1">Request clinic listing</p>
            <p className="text-muted text-sm mt-2">영업일 기준 2일 내에 연락드립니다. · We'll get back to you within 2 business days.</p>
          </div>
          <ClinicListingForm />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 font-serif text-ink">
            <LogoMark className="h-5 w-5 text-jade-dark" />
            Seoul Glow Guide
          </span>
        </div>
      </footer>
    </div>
  );
}
