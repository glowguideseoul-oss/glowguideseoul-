"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ExitIntentModal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messenger, setMessenger] = useState("WhatsApp");
  const [messengerId, setMessengerId] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("exit_shown")) return;

    let readyAt = Date.now() + 5000;

    const handle = (e: MouseEvent) => {
      if (e.clientY <= 0 && Date.now() >= readyAt) {
        setVisible(true);
        sessionStorage.setItem("exit_shown", "1");
        document.removeEventListener("mouseleave", handle);
      }
    };

    document.addEventListener("mouseleave", handle);
    return () => document.removeEventListener("mouseleave", handle);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await getSupabase().from("appointment_requests").insert({
      inquiry_type: "exit-intent",
      messenger_type: messenger,
      messenger_id: messengerId || null,
    });
    setDone(true);
  }

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="relative w-full max-w-sm bg-white rounded-[28px] p-7 shadow-2xl">
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-warm border border-border text-muted hover:text-ink"
        >
          <X size={14} />
        </button>

        {!done ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="w-12 h-12 bg-jade-light rounded-2xl flex items-center justify-center mb-2">
              <Sparkles size={20} className="text-jade-dark" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-ink mb-1">서울 방문 계획 있으세요?</h3>
              <p className="text-sm text-muted leading-relaxed">
                메신저 ID만 남겨주세요. 클리닉 매칭부터 방문 준비까지 도와드릴게요.
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={messenger}
                onChange={(e) => setMessenger(e.target.value)}
                className="shrink-0 border border-border rounded-2xl px-3 py-2.5 text-sm text-ink bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
              >
                <option>WhatsApp</option>
                <option>KakaoTalk</option>
                <option>LINE</option>
              </select>
              <input
                type="text"
                value={messengerId}
                onChange={(e) => setMessengerId(e.target.value)}
                placeholder={messenger === "WhatsApp" ? "Phone number" : messenger === "LINE" ? "LINE ID" : "KakaoTalk ID"}
                className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-muted bg-warm focus:outline-none focus:ring-2 focus:ring-jade/30"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-jade text-white rounded-full py-3 text-sm font-semibold hover:bg-jade-dark transition-colors"
            >
              무료 상담 받기
            </button>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="w-full text-xs text-muted hover:text-ink transition-colors"
            >
              괜찮아요, 다음에 볼게요
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-jade-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={20} className="text-jade-dark" />
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">감사합니다!</h3>
            <p className="text-sm text-muted mb-5">곧 연락드릴게요.</p>
            <button
              onClick={() => setVisible(false)}
              className="bg-jade text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-jade-dark transition-colors"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
