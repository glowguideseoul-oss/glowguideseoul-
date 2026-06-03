import Navbar from "@/components/Navbar";
import { aftercareChecklists } from "@/lib/mock-data";
import { CheckCircle2, Circle, Phone } from "lucide-react";

export default function AftercarePage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">Aftercare</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Aftercare Checklist</h1>
          <p className="text-muted text-sm">Skin Booster / Hydration — day-by-day guide.</p>
        </div>

        <div className="space-y-4">
          {aftercareChecklists.skinBooster.map((period, i) => (
            <div key={period.day} className="bg-white rounded-[28px] border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i === 0 ? "bg-coral text-white" : "bg-coral-light text-coral"}`}>
                  {i + 1}
                </div>
                <h2 className="font-semibold text-ink">{period.day}</h2>
              </div>
              <ul className="space-y-3">
                {period.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-3">
                    {i === 0 ? (
                      <CheckCircle2 size={17} className="text-coral mt-0.5 shrink-0" />
                    ) : (
                      <Circle size={17} className="text-border mt-0.5 shrink-0" />
                    )}
                    <span className="text-sm text-muted">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Symptom contact guide */}
        <div className="mt-6 bg-white rounded-[28px] border border-border p-6">
          <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <Phone size={16} className="text-coral" />
            When to contact the clinic
          </h2>
          <ul className="space-y-3">
            {[
              { signal: "Contact clinic", desc: "Swelling or redness lasting more than 5 days" },
              { signal: "Contact clinic", desc: "Unusual pain or burning sensation" },
              { signal: "Seek emergency care", desc: "Difficulty breathing or severe allergic reaction", urgent: true },
              { signal: "Contact clinic", desc: "Blistering or open wounds at treatment site" },
            ].map((item) => (
              <li key={item.desc} className="flex items-start gap-3">
                <span className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 mt-0.5 ${item.urgent ? "bg-red-100 text-red-600" : "bg-coral-light text-coral"}`}>
                  {item.signal}
                </span>
                <span className="text-sm text-muted">{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow-up template */}
        <div className="mt-5 bg-white rounded-[28px] border border-border p-6">
          <h2 className="font-semibold text-ink mb-3">Follow-up message template</h2>
          <div className="bg-warm rounded-2xl p-4 border border-border text-sm text-muted leading-relaxed">
            Hello, I visited your clinic on [date] for [treatment]. I wanted to share my recovery progress and ask a question about [concern]. Could you please advise?
          </div>
          <div className="mt-3 bg-warm rounded-2xl p-4 border border-border text-sm text-muted leading-relaxed">
            안녕하세요. [날짜]에 [시술]을 받은 환자입니다. 회복 중에 [증상]이 있어 문의드립니다. 확인 부탁드립니다.
          </div>
          <button className="mt-3 w-full border border-border rounded-full py-2.5 text-sm text-muted hover:border-coral hover:text-coral transition-colors">
            Copy template
          </button>
        </div>

        <p className="text-xs text-muted text-center mt-8">
          This guide is for general reference only. Follow your clinic&apos;s specific aftercare instructions.
        </p>
      </div>
    </div>
  );
}
