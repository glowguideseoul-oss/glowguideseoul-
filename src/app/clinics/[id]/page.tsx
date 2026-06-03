import { clinics } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import ClinicDetailClient from "./ClinicDetailClient";
import { notFound } from "next/navigation";

export default async function ClinicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinic = clinics.find((c) => c.id === id);
  if (!clinic) notFound();

  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <ClinicDetailClient clinic={clinic} />
    </div>
  );
}
