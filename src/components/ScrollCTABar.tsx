"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import StartPlanningModal from "./StartPlanningModal";

export default function ScrollCTABar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [modal, setModal] = useState<"find" | "booked" | null>(null);

  useEffect(() => {
    if (dismissed) return;
    const handle = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3.5 shadow-2xl">
          <p className="text-sm font-medium text-white/80 truncate">
            어떤 시술 받을지 아직 모르세요?
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModal("find")}
              className="inline-flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-xs font-semibold text-white hover:bg-jade-dark transition-colors"
            >
              무료 매칭
              <ArrowRight size={12} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <StartPlanningModal initialFlow={modal} onClose={() => setModal(null)} />
      )}
    </>
  );
}
