import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink, Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { updateClinicStatus } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = {
  status?: string;
  district?: string;
  q?: string;
  page?: string;
};

export default async function AdminClinicsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  await requireAdmin();

  const params = await searchParams;
  const status = params?.status ?? "draft";
  const district = params?.district ?? "all";
  const q = params?.q?.trim() ?? "";
  const page = Math.max(Number(params?.page ?? "1"), 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("clinics")
    .select(
      "id,display_name,legal_name,description,location_label,district,address_name,road_address_name,phone,kakao_place_url,clinic_type,profile_status,review_status,sponsored_status,price_range_label,foreigner_support,source_place_id,created_at",
      { count: "exact" },
    )
    .order("district", { ascending: true })
    .order("display_name", { ascending: true })
    .range(from, to);

  if (status !== "all") {
    if (status === "published") query = query.eq("profile_status", "published");
    if (status === "draft") query = query.eq("profile_status", "draft");
    if (status === "rejected") query = query.eq("review_status", "rejected");
    if (status === "prospect") query = query.eq("sponsored_status", "prospect");
  }

  if (district !== "all") {
    query = query.eq("district", district);
  }

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,legal_name.ilike.%${q}%,address_name.ilike.%${q}%`);
  }

  const [
    { data: clinics, error, count },
    { data: districts },
    draftCount,
    publishedCount,
    rejectedCount,
    prospectCount,
    rawManualCount,
  ] = await Promise.all([
    query,
    supabase.from("clinics").select("district").not("district", "is", null).order("district"),
    countRows("clinics", "profile_status", "draft"),
    countRows("clinics", "profile_status", "published"),
    countRows("clinics", "review_status", "rejected"),
    countRows("clinics", "sponsored_status", "prospect"),
    countRows("raw_clinic_places", "review_status", "needs_manual_review"),
  ]);

  const districtOptions = Array.from(new Set((districts ?? []).map((item) => item.district).filter(Boolean)));
  const totalPages = Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
              <ArrowLeft size={14} />
              Admin inbox
            </Link>
            <h1 className="text-2xl font-bold text-gray-950">클리닉 검수</h1>
            <p className="mt-1 text-sm text-gray-500">
              공개 가능한 디렉토리 후보를 검수하고, 영업 후보를 표시합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
            <Stat label="Draft" value={draftCount} />
            <Stat label="Published" value={publishedCount} />
            <Stat label="Rejected" value={rejectedCount} />
            <Stat label="Prospect" value={prospectCount} />
            <Stat label="Raw manual" value={rawManualCount} />
          </div>
        </div>

        <form className="mb-5 grid gap-3 rounded-3xl border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_180px_170px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              name="q"
              defaultValue={q}
              placeholder="병원명, 주소 검색"
              className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="prospect">Prospect</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <select
            name="district"
            defaultValue={district}
            className="h-11 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="all">전체 지역</option>
            {districtOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="h-11 rounded-full bg-gray-950 px-6 text-sm font-semibold text-white hover:bg-gray-700">
            검색
          </button>
        </form>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
          <span>{count ?? 0}개 결과</span>
          <span>
            Page {page} / {totalPages}
          </span>
        </div>

        <div className="space-y-3">
          {(clinics ?? []).map((clinic) => (
            <article key={clinic.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone={clinic.profile_status === "published" ? "green" : clinic.review_status === "rejected" ? "red" : "gray"}>
                      {clinic.profile_status}
                    </Badge>
                    <Badge tone={clinic.sponsored_status === "prospect" ? "orange" : "gray"}>
                      {clinic.sponsored_status}
                    </Badge>
                    <Badge tone={clinic.clinic_type === "plastic_surgery" ? "pink" : "blue"}>
                      {clinic.clinic_type}
                    </Badge>
                  </div>

                  <h2 className="text-lg font-bold text-gray-950">{clinic.display_name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{clinic.road_address_name ?? clinic.address_name}</p>
                  <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                    <Field label="지역" value={clinic.district ?? "-"} />
                    <Field label="전화" value={clinic.phone ?? "-"} />
                    <Field label="가격" value={clinic.price_range_label ?? "-"} />
                    <Field label="외국어" value={clinic.foreigner_support ?? "-"} />
                  </div>
                  <p className="mt-3 rounded-2xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                    {clinic.description}
                  </p>
                  {clinic.kakao_place_url && (
                    <a
                      href={clinic.kakao_place_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-950"
                    >
                      Kakao place
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                <div className="grid content-start gap-2">
                  <ActionButton id={clinic.id} action="publish" label="공개 승인" className="bg-emerald-600 text-white hover:bg-emerald-700" />
                  <ActionButton id={clinic.id} action="draft" label="비공개 draft" className="bg-gray-900 text-white hover:bg-gray-700" />
                  <ActionButton id={clinic.id} action="prospect" label="영업 후보 표시" className="bg-amber-500 text-white hover:bg-amber-600" />
                  <ActionButton id={clinic.id} action="reject" label="제외 처리" className="bg-red-50 text-red-700 hover:bg-red-100" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <PageLink disabled={page <= 1} page={page - 1} status={status} district={district} q={q}>
            이전
          </PageLink>
          <PageLink disabled={page >= totalPages} page={page + 1} status={status} district={district} q={q}>
            다음
          </PageLink>
        </div>
      </div>
    </div>
  );
}

async function countRows(table: string, column: string, value: string) {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);
  return count ?? 0;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="truncate font-medium text-gray-800">{value}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: "gray" | "green" | "red" | "orange" | "pink" | "blue" }) {
  const className = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-amber-100 text-amber-700",
    pink: "bg-rose-100 text-rose-700",
    blue: "bg-sky-100 text-sky-700",
  }[tone];

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function ActionButton({ id, action, label, className }: { id: number; action: string; label: string; className: string }) {
  return (
    <form action={updateClinicStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <button className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${className}`}>
        {label}
      </button>
    </form>
  );
}

function PageLink({
  disabled,
  page,
  status,
  district,
  q,
  children,
}: {
  disabled: boolean;
  page: number;
  status: string;
  district: string;
  q: string;
  children: ReactNode;
}) {
  const href = `/admin/clinics?status=${encodeURIComponent(status)}&district=${encodeURIComponent(district)}&q=${encodeURIComponent(q)}&page=${page}`;
  if (disabled) {
    return <span className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-300">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:border-gray-900">
      {children}
    </Link>
  );
}
