import { useState } from "react";
import { Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";

type UploadType = "sales" | "cost" | "customer" | "review";

const typeTabs: { value: UploadType; label: string }[] = [
  { value: "sales", label: "매출" },
  { value: "cost", label: "원가/메뉴" },
  { value: "customer", label: "고객/포인트" },
  { value: "review", label: "리뷰" },
];

type ColumnGuide = {
  required: string[];
  optional: string[];
  note?: string;
};

const columnGuides: Record<UploadType, ColumnGuide> = {
  sales: {
    required: ["store_id", "sale_date", "menu_id", "quantity", "amount", "payment_type"],
    optional: ["discount_amount", "cancel_flag", "order_channel"],
    note: "날짜 형식: YYYY-MM-DD",
  },
  cost: {
    required: ["menu_id", "menu_name", "category", "cost_price", "sale_price"],
    optional: ["effective_date", "supplier_id", "unit"],
    note: "메뉴ID는 POS 메뉴 코드와 일치해야 합니다",
  },
  customer: {
    required: ["customer_key", "consent_yn", "visit_date", "point_earn", "point_use"],
    optional: ["grade", "birth_month", "channel"],
    note: "개인정보(이름/전화/이메일)는 자동 마스킹 처리됩니다",
  },
  review: {
    required: ["review_date", "platform", "review_text", "star_rating"],
    optional: ["menu_id", "store_id", "reply_yn"],
    note: "날짜 형식: YYYY-MM-DD, 평점: 1~5",
  },
};

type PipelineStep = {
  label: string;
  status: "completed" | "processing" | "pending" | "failed";
  duration?: string;
};

const pipelineSteps: PipelineStep[] = [
  { label: "정규화", status: "completed", duration: "2.1초" },
  { label: "KPI 집계", status: "completed", duration: "4.8초" },
  { label: "마진가드 재계산", status: "processing" },
  { label: "RFM 재산출", status: "pending" },
  { label: "이상탐지", status: "pending" },
  { label: "브리핑 예약", status: "pending" },
];

type UploadHistory = {
  id: string;
  fileName: string;
  type: string;
  store: string;
  status: "completed" | "processing" | "error";
  uploadedAt: string;
  rows: number;
};

const uploadHistory: UploadHistory[] = [
  { id: "u1", fileName: "sales_2026_03_05.csv", type: "매출", store: "전체", status: "completed", uploadedAt: "2026-03-05 14:20", rows: 12480 },
  { id: "u2", fileName: "cost_menu_v3.xlsx", type: "원가/메뉴", store: "전체", status: "completed", uploadedAt: "2026-03-04 09:10", rows: 342 },
  { id: "u3", fileName: "customers_march.csv", type: "고객/포인트", store: "A매장", status: "error", uploadedAt: "2026-03-03 16:55", rows: 0 },
  { id: "u4", fileName: "reviews_feb.csv", type: "리뷰", store: "전체", status: "completed", uploadedAt: "2026-03-01 11:30", rows: 4821 },
];

const statusBadge = (s: UploadHistory["status"]) => {
  if (s === "completed") return "border-[#BFD4FF] bg-[#EEF4FF] text-primary";
  if (s === "error") return "border-red-200 bg-red-50 text-red-600";
  return "border-amber-200 bg-amber-50 text-amber-600";
};

const statusLabel: Record<UploadHistory["status"], string> = {
  completed: "완료",
  processing: "처리중",
  error: "오류",
};

const pipelineColor = (s: PipelineStep["status"]) => {
  if (s === "completed") return "bg-emerald-500 text-white";
  if (s === "processing") return "bg-primary text-white animate-pulse";
  if (s === "failed") return "bg-red-500 text-white";
  return "bg-[#DCE4F3] text-slate-400";
};

export const DataUploadPage = () => {
  const [selectedType, setSelectedType] = useState<UploadType>("sales");
  const [selectedStore, setSelectedStore] = useState("전체 매장");
  const [showPipeline, setShowPipeline] = useState(true);

  const guide = columnGuides[selectedType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">데이터 업로드</h2>
        <p className="mt-1 text-base text-slate-500">원천 파일을 업로드하고 처리 상태를 확인합니다.</p>

        {/* Type Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={
                selectedType === tab.value
                  ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-[#2454C8]"
                  : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-medium text-slate-600"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Column Guide Panel */}
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">
            {typeTabs.find((t) => t.value === selectedType)?.label} — 컬럼 안내
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-blue-700">필수 컬럼</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.required.map((col) => (
                  <span key={col} className="rounded border border-blue-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-blue-700">
                    {col}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500">권장 컬럼</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.optional.map((col) => (
                  <span key={col} className="rounded border border-[#DCE4F3] bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {guide.note && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {guide.note}
            </p>
          )}
        </div>

        {/* Upload + Preview */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="rounded-xl border-2 border-dashed border-[#DCE4F3] bg-[#F7FAFF] p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">파일을 드래그하거나 선택하세요</p>
              <p className="mt-1 text-xs text-slate-400">CSV · XLSX 지원 (최대 50MB)</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                파일 선택
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">매장</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm"
                >
                  <option>전체 매장</option>
                  {storeNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">데이터 기간</label>
                <input
                  type="month"
                  defaultValue="2026-03"
                  className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm"
                />
              </div>
            </div>

            <button className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              업로드 적용
            </button>
          </div>

          <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
            <p className="text-sm font-semibold text-slate-800">미리보기 (상위 10행)</p>
            <div className="mt-3 flex h-48 items-center justify-center rounded-lg border border-[#D6E0F0] bg-white text-sm text-slate-500">
              선택된 파일이 없습니다
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      {showPipeline && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">업로드 처리 파이프라인</h3>
              <p className="mt-0.5 text-sm text-slate-500">업로드 적용 후 6단계 데이터 처리 현황입니다.</p>
            </div>
            <button
              onClick={() => setShowPipeline(false)}
              className="rounded border border-border px-2 py-1 text-xs text-slate-500"
            >
              닫기
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {pipelineSteps.map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${pipelineColor(step.status)}`}>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : step.status === "processing" ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${step.status === "pending" ? "text-slate-400" : "text-slate-700"}`}>
                    {step.label}
                  </p>
                  {step.duration && (
                    <p className="text-[10px] text-slate-400">{step.duration}</p>
                  )}
                  {step.status === "processing" && (
                    <p className="text-[10px] text-primary">처리중...</p>
                  )}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="absolute hidden" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />완료
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />처리중
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#DCE4F3]" />대기중
            </span>
            <button className="ml-auto rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#F8FAFF]">
              완료 시 알림 받기
            </button>
          </div>
        </section>
      )}

      {/* Upload History */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">업로드 이력</h3>
            <p className="mt-0.5 text-sm text-slate-500">최근 업로드 이력 및 처리 현황입니다.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["전체", "완료", "오류"] as const).map((f) => (
              <button key={f} className="rounded border border-[#D6E0F0] bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-[#F8FAFF]">
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3">파일명</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">매장</th>
                <th className="px-4 py-3">건수</th>
                <th className="px-4 py-3">업로드 일시</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      <span className="font-medium text-slate-800">{row.fileName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.type}</td>
                  <td className="px-4 py-3 text-slate-600">{row.store}</td>
                  <td className="px-4 py-3 text-slate-600">{row.rows > 0 ? row.rows.toLocaleString() : "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{row.uploadedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${statusBadge(row.status)}`}>
                      {statusLabel[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status === "error" && (
                      <button className="rounded border border-[#D6E0F0] bg-white px-2 py-1 text-xs text-slate-700 hover:bg-[#F8FAFF]">
                        재처리
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
