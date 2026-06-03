import type { Metadata } from "next";
import { clinics } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import ClinicDetailClient from "./ClinicDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const clinic = clinics.find((c) => c.id === id);
  if (!clinic) return {};

  return {
    title: clinic.name,
    description: `Foreigner-ready clinic guide for ${clinic.name} in Seoul — consultation tips, language support, and aftercare information.`,
    openGraph: {
      title: `${clinic.name} — Seoul Glow Guide`,
      description: `Clinic guide for international patients visiting ${clinic.name} in ${clinic.location}, Seoul.`,
      url: `https://glowguideseoul.com/clinics/${clinic.id}`,
    },
  };
}

export function generateStaticParams() {
  return clinics.map((c) => ({ id: c.id }));
}

export default async function ClinicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinic = clinics.find((c) => c.id === id);
  if (!clinic) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinic.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: clinic.location,
      addressCountry: "KR",
    },
    description: clinic.description,
    url: `https://glowguideseoul.com/clinics/${clinic.id}`,
  };

  return (
    <div className="min-h-screen bg-warm font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ClinicDetailClient clinic={clinic} />
    </div>
  );
}
