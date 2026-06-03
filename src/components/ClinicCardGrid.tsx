"use client";

import { useState } from "react";
import Link from "next/link";
import ClinicCard from "./ClinicCard";
import type { ClinicForCard } from "@/lib/clinics-db";

const PAGE_SIZE = 6;

export default function ClinicCardGrid({ clinics }: { clinics: ClinicForCard[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = clinics.slice(0, visibleCount);
  const hasMore = visibleCount < clinics.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}

        {!hasMore && (
          <div className="soft-card rounded-[28px] border-dashed p-6 flex flex-col items-center justify-center text-center min-h-[280px] gap-3">
            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-muted text-lg">
              +
            </div>
            <p className="font-medium text-ink text-sm">More clinics being added</p>
            <p className="text-xs text-muted leading-relaxed max-w-[180px]">
              We&apos;re onboarding foreigner-ready clinics in Seoul. Check back soon.
            </p>
            <Link
              href="/for-clinics"
              className="mt-2 text-xs text-coral font-medium hover:underline"
            >
              Is your clinic interested? →
            </Link>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-muted hover:border-jade/40 hover:text-ink transition-colors"
          >
            Load more · {clinics.length - visibleCount} remaining
          </button>
        </div>
      )}
    </>
  );
}
