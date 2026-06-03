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
          클리닉 추천 받기
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => setModal("booked")}
          className="inline-flex w-full items-center justify-center bg-white/70 text-ink border border-border rounded-full px-7 py-3.5 font-semibold hover:border-jade/30 transition-colors sm:w-auto"
        >
          마음에 드는 클리닉이 있어요
        </button>
      </div>

      <p className="mt-4 text-xs text-muted/70 max-w-sm">
        아직 어떤 클리닉이 좋을지 모르겠어요.{" "}
        <span className="text-jade-dark font-medium">방문 전 무료 매칭 받기.</span>
        {"  "}이미 가고 싶은 클리닉이 있어요.{" "}
        <span className="text-ink font-medium">상담 신청하고 방문 준비하기.</span>
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
