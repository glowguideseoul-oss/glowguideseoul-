import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllEventsAdmin, getPublishedClinicsForEvents } from "@/lib/events-db";
import { createEvent, updateEventStatus, deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireAdmin();

  const [events, clinics] = await Promise.all([
    getAllEventsAdmin(),
    getPublishedClinicsForEvents(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={14} />
            Admin inbox
          </Link>
          <h1 className="text-2xl font-bold text-gray-950">이벤트 관리</h1>
          <p className="mt-1 text-sm text-gray-500">파트너 병원 이벤트 / 프로모션 등록 및 공개 관리</p>
        </div>

        {/* Create form */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">새 이벤트 등록</h2>
          <form action={createEvent} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">병원 선택 *</label>
                <select
                  name="clinic_id"
                  required
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="">병원 선택...</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">이벤트 제목 *</label>
                <input
                  name="title"
                  required
                  placeholder="예: Summer Laser Promo"
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">프로모 문구</label>
                <input
                  name="promo_text"
                  placeholder="예: 20% off this month"
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">이미지 URL</label>
                <input
                  name="image_url"
                  type="url"
                  placeholder="https://..."
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">시작일</label>
                <input
                  name="start_date"
                  type="date"
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">종료일</label>
                <input
                  name="end_date"
                  type="date"
                  className="w-full h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">설명</label>
              <textarea
                name="description"
                rows={3}
                placeholder="이벤트 상세 내용..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>
            <button
              type="submit"
              className="self-start rounded-full bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Draft으로 등록
            </button>
          </form>
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {events.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">등록된 이벤트 없음</p>
          )}
          {events.map((event) => {
            const clinic = (Array.isArray(event.clinics) ? event.clinics[0] : event.clinics) as { display_name: string } | null;
            return (
              <div key={event.id} className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                        event.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-xs text-gray-400">{clinic?.display_name}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    {event.promo_text && (
                      <p className="text-sm text-emerald-600 font-medium mt-0.5">{event.promo_text}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                    )}
                    {(event.start_date || event.end_date) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {event.start_date} {event.end_date ? `~ ${event.end_date}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={updateEventStatus}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="action" value={event.status === "published" ? "draft" : "publish"} />
                      <button className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                        event.status === "published"
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}>
                        {event.status === "published" ? "비공개" : "공개"}
                      </button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-full px-4 py-2 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
