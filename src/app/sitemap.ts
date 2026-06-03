import type { MetadataRoute } from "next";
import { clinics } from "@/lib/mock-data";

const BASE = "https://glowguideseoul.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/for-clinics`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tools/phrasebook`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/taxi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/map`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/consultation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/payment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tools/aftercare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const clinicPages: MetadataRoute.Sitemap = clinics.map((clinic) => ({
    url: `${BASE}/clinics/${clinic.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...clinicPages];
}
