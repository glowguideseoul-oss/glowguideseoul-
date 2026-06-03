import Navbar from "@/components/Navbar";

const questions = [
  { category: "About the procedure", qs: [
    "What exactly is included in this procedure?",
    "How long will it take?",
    "What results can I realistically expect?",
    "Are there any risks or side effects I should know about?",
    "Is this procedure suitable for my skin type?",
  ]},
  { category: "Recovery", qs: [
    "How long is the downtime?",
    "What should I avoid after the procedure?",
    "When can I wear makeup again?",
    "When can I exercise or drink alcohol?",
    "What is the aftercare routine?",
  ]},
  { category: "Practical", qs: [
    "What is the total cost including all extras?",
    "Can I get a written quote?",
    "Do you have English-speaking staff?",
    "Can I get the aftercare guide in English?",
    "How do I reach you if I have questions after I leave Korea?",
  ]},
  { category: "Documents to bring", qs: [
    "Passport",
    "List of current medications",
    "Known allergies",
    "Previous treatment records (if relevant)",
  ]},
];

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-warm font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-medium bg-coral-light text-coral rounded-full px-3 py-1">Before Visit</span>
          <h1 className="font-serif text-4xl text-ink mt-4 mb-2">Consultation Questions</h1>
          <p className="text-muted text-sm">Save or screenshot this before your appointment.</p>
        </div>

        <div className="space-y-4">
          {questions.map((section) => (
            <div key={section.category} className="bg-white rounded-[28px] border border-border p-6">
              <h2 className="font-semibold text-ink mb-4">{section.category}</h2>
              <ul className="space-y-2.5">
                {section.qs.map((q) => (
                  <li key={q} className="flex items-start gap-3 text-sm text-muted">
                    <span className="w-1.5 h-1.5 bg-coral rounded-full mt-1.5 shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
