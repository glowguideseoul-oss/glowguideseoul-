import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: consultations, error: e1 }, { data: inquiries, error: e2 }] = await Promise.all([
    supabase.from("appointment_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("clinic_listing_inquiries").select("*").order("created_at", { ascending: false }),
  ]);

  const dbError = e1 || e2;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seoul Glow Admin</h1>
        <p className="text-sm text-gray-500 mb-10">내부용 · Inbox only</p>

        {dbError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
            <p className="font-semibold mb-1">DB 연결 오류</p>
            <p className="font-mono text-xs">{dbError.message}</p>
            <p className="mt-2 text-xs text-red-500">Vercel에 SUPABASE_SERVICE_ROLE_KEY가 올바르게 설정됐는지, SQL 마이그레이션이 실행됐는지 확인해주세요.</p>
          </div>
        )}

        {/* Consultation Requests */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">상담 신청 · Consultation Requests</h2>
            <span className="text-sm bg-jade-light text-jade-dark rounded-full px-3 py-1 font-medium">
              {consultations?.length ?? 0}건
            </span>
          </div>

          {!consultations?.length ? (
            <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-2xl">
              아직 신청이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {consultations.map((row) => (
                <div key={row.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                        row.inquiry_type === "clinic-inquiry"
                          ? "bg-coral-light text-coral-dark"
                          : "bg-jade-light text-jade-dark"
                      }`}>
                        {row.inquiry_type === "clinic-inquiry" ? "클리닉 상담" : "클리닉 매칭"}
                      </span>
                      {row.status === "new" && (
                        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-yellow-100 text-yellow-700">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {row.clinic_name && <Field label="클리닉" value={row.clinic_name} />}
                    {row.treatment_interest && <Field label="관심 시술" value={row.treatment_interest} />}
                    {row.area && <Field label="지역" value={row.area} />}
                    {row.preferred_language && <Field label="언어" value={row.preferred_language} />}
                    {row.messenger_type && (
                      <Field label="메신저" value={`${row.messenger_type}: ${row.messenger_id}`} />
                    )}
                    {row.arrival_date && (
                      <Field label="방한 일정" value={`${row.arrival_date} → ${row.departure_date ?? "?"}`} />
                    )}
                    {row.budget_range && <Field label="예산" value={row.budget_range} />}
                  </div>

                  {row.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      {row.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Clinic Listing Inquiries */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">클리닉 등록 문의 · Clinic Inquiries</h2>
            <span className="text-sm bg-coral-light text-coral-dark rounded-full px-3 py-1 font-medium">
              {inquiries?.length ?? 0}건
            </span>
          </div>

          {!inquiries?.length ? (
            <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-2xl">
              아직 문의가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {inquiries.map((row) => (
                <div key={row.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{row.clinic_name}</span>
                      {row.status === "new" && (
                        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-yellow-100 text-yellow-700">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {row.contact_person && <Field label="담당자" value={row.contact_person} />}
                    {row.email && <Field label="이메일" value={row.email} />}
                    {row.location_label && <Field label="위치" value={row.location_label} />}
                    {row.supported_languages && <Field label="지원 언어" value={row.supported_languages} />}
                    {row.monthly_budget_range && <Field label="예산" value={row.monthly_budget_range} />}
                  </div>

                  {row.message && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      {row.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="font-medium text-gray-800 truncate">{value}</p>
    </div>
  );
}
