import { useState } from "react";
import { Upload, CheckCircle2, Clock, AlertCircle, FileText, RefreshCcw } from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

type UploadType = "sales" | "cost" | "customer" | "review";

const typeTabs: { value: UploadType; label: string }[] = [
  { value: "sales", label: "매출" },
  { value: "cost", label: "원재료/원가" },
  { value: "customer", label: "고객/멤버십" },
  { value: "review", label: "리뷰/클레임" },
];

const columnGuides: Record<UploadType, { required: string[]; optional: string[]; note?: string }> = {
  sales: {
    required: ["매장코드", "주문일시", "메뉴명", "결제금액"],
    optional: ["주문번호", "할인금액", "결제수단", "채널(배달/홀)"],
    note: "POS 매출 데이터 기준 (CSV/XLSX)",
  },
  cost: {
    required: ["매장코드", "재료명", "입고단가", "수량"],
    optional: ["거래처", "유통기한", "안전재고수준"],
  },
  customer: {
    required: ["고객ID", "가입일", "최근방문일", "누적금액"],
    optional: ["연령대", "성별", "포인트잔액"],
  },
  review: {
    required: ["리뷰ID", "작성일", "평점", "내용"],
    optional: ["답변여부", "주문메뉴", "이미지유무"],
  },
};

type UploadHistory = {
  id: string;
  fileName: string;
  type: string;
  store: string;
  rows: number;
  uploadedAt: string;
  status: "completed" | "processing" | "error";
};

const initialHistory: UploadHistory[] = [
  { id: "h1", fileName: "2026_03_매출_강남역점.xlsx", type: "매출", store: "강남역점", rows: 1240, uploadedAt: "2026-03-09 10:20", status: "completed" },
  { id: "h2", fileName: "고객_멤버십_W10.csv", type: "고객", store: "전체", rows: 8500, uploadedAt: "2026-03-09 09:15", status: "completed" },
  { id: "h3", fileName: "원가_데이터_v2.xlsx", type: "원가", store: "역삼점", rows: 0, uploadedAt: "2026-03-08 16:45", status: "error" },
  { id: "h4", fileName: "리뷰_수집_데이터.csv", type: "리뷰", store: "논현점", rows: 450, uploadedAt: "2026-03-08 14:30", status: "completed" },
];

export const DataUploadPage = () => {
  const [selectedType, setSelectedType] = useState<UploadType>("sales");
  const [selectedStore, setSelectedStore] = useState("전체 매장");
  const [showPipeline, setShowPipeline] = useState(false);
  const [uploadHistory] = useState(initialHistory);

  const guide = columnGuides[selectedType];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="app-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-foreground">데이터 업로드</h2>
        <p className="mt-1 text-base text-muted-foreground">원천 파일을 업로드하고 처리 상태를 확인합니다.</p>

        {/* Type Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition-all shadow-sm",
                selectedType === tab.value
                  ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                  : "border-[#d5deec] bg-card text-[#4a5568] hover:bg-[#f4f7ff]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Column Guide Panel */}
        <div className="mt-4 rounded-xl border border-[#c9d8ff] bg-[#f4f7ff] p-4 shadow-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary">
            {typeTabs.find((t) => t.value === selectedType)?.label} — 컬럼 안내
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#34415b]">필수 컬럼</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.required.map((col) => (
                  <span key={col} className="rounded border border-[#c9d8ff] bg-card px-2 py-0.5 font-mono text-[11px] font-semibold text-primary shadow-sm">
                    {col}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[var(--subtle-foreground)]">권장 컬럼</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.optional.map((col) => (
                  <span key={col} className="rounded border border-[#d5deec] bg-card px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground shadow-sm">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload + Preview */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="rounded-xl border-2 border-dashed border-[#d5deec] bg-[#f4f7ff] p-8 text-center transition-colors hover:border-primary/30">
              <Upload className="mx-auto h-8 w-8 text-[#b0bdd4]" />
              <p className="mt-3 text-sm font-semibold text-[#34415b]">파일을 드래그하거나 선택하세요</p>
              <p className="mt-1 text-xs text-[var(--subtle-foreground)]">CSV · XLSX 지원 (최대 50MB)</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
                파일 선택
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">매장</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                >
                  <option>전체 매장</option>
                  {storeNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">데이터 기간</label>
                <input
                  type="month"
                  defaultValue="2026-03"
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <button onClick={() => setShowPipeline(true)} className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
              업로드 적용
            </button>
          </div>

          <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm">
            <p className="text-xs font-bold text-[var(--subtle-foreground)] uppercase tracking-wider mb-3">미리보기 (상위 10행)</p>
            <div className="flex h-48 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-sm text-[var(--subtle-foreground)] shadow-inner">
              선택된 파일이 없습니다
            </div>
          </div>
        </div>
      </section>

      {/* Upload History Section */}
      <section className="app-card overflow-hidden">
        <div className="app-section-header">
          <h3 className="text-lg font-bold text-foreground">업로드 이력</h3>
          <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">Recent 10 Entries</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">파일명</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">유형</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-32">매장</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">건수</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-48">업로드 일시</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-32">상태</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider text-right w-24">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {uploadHistory.map((row) => (
                <tr key={row.id} className="group transition-all hover:bg-[var(--surface-hover)]/70 font-medium">
                  <td className="pl-8 pr-4 py-4 border-r border-[var(--border)]/40">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#b0bdd4]" />
                      <span className="font-bold text-[#1a2138]">{row.fileName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[var(--border)]/40 text-[#4a5568]">{row.type}</td>
                  <td className="px-4 py-4 text-center border-r border-[var(--border)]/40 text-[#4a5568]">{row.store}</td>
                  <td className="px-4 py-4 text-center border-r border-[var(--border)]/40 font-mono text-xs">{row.rows > 0 ? row.rows.toLocaleString() : "-"}</td>
                  <td className="px-4 py-4 text-muted-foreground text-xs border-r border-[var(--border)]/40 font-mono">{row.uploadedAt}</td>
                  <td className="px-4 py-4 text-center border-r border-[var(--border)]/40">
                    <span className={cn(
                      "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black shadow-sm",
                      row.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      row.status === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-primary border-blue-100"
                    )}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="pl-4 pr-8 py-4 text-right">
                    {row.status === "error" && (
                      <button className="p-2 rounded-xl bg-card border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all">
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Standard Pagination Area */}
        <div className="px-8 py-4 bg-card border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Page 1 of 3</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all disabled:opacity-30 shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">2</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">3</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
