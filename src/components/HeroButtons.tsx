"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StartPlanningModal from "./StartPlanningModal";

export default function HeroButtons() {
  const [modal, setModal] = useState<"find" | "booked" | null>(null);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setModal("find")}
          className="inline-flex w-full items-center justify-center gap-2 bg-jade text-white rounded-full px-7 py-3.5 font-semibold shadow-sm hover:bg-jade-dark transition-colors sm:w-auto"
        >
          Find my clinic
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => setModal("booked")}
          className="inline-flex w-full items-center justify-center bg-white/70 text-ink border border-border rounded-full px-7 py-3.5 font-semibold hover:border-jade/30 transition-colors sm:w-auto"
        >
          Check a clinic I found
        </button>
      </div>

      <p className="mt-4 text-xs text-muted/70 max-w-sm">
        Not sure which clinic is right for you?{" "}
        <span className="text-jade-dark font-medium">Get matched before you fly.</span>
        {"  "}Already have one in mind?{" "}
        <span className="text-ink font-medium">Check it before you book.</span>
      </p>

      <div className="mt-6">
        <Link href="/for-clinics" className="text-xs text-muted hover:text-ink underline underline-offset-2 transition-colors">
          Are you a clinic operator? →
        </Link>
      </div>

      {modal && (
        <StartPlanningModal
          initialFlow={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
