import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle2, Clock, AlertCircle, FileText, RefreshCcw, Database, Layers, Search, History } from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";
import { uploadDataFile, getUploadJobs, retryUploadJob } from "@/services/data";
import type { DataType } from "@/types/api";

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
];

export const DataUploadPage = () => {
  const [selectedType, setSelectedType] = useState<UploadType>("sales");
  const [selectedStore, setSelectedStore] = useState("전체 매장");
  const [uploadHistory, setUploadHistory] = useState(initialHistory);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const guide = columnGuides[selectedType];

  // API 연결: 업로드 이력 로드
  useEffect(() => {
    let alive = true;
    getUploadJobs()
      .then((res) => {
        if (!alive || res.items.length === 0) return;
        setUploadHistory(res.items.map((j) => ({
          id: j.id,
          fileName: j.original_filename,
          type: j.data_type,
          store: j.store_id,
          rows: j.preview_rows?.length ?? 0,
          uploadedAt: j.created_at.replace("T", " ").slice(0, 16),
          status: j.status === "completed" ? "completed" : j.status === "pending" || j.status === "processing" ? "processing" : "error",
        })));
      })
      .catch(() => { /* mock 유지 */ });
    return () => { alive = false; };
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setUploading(true);
    const storeId = selectedStore === "전체 매장" ? "global" : selectedStore;
    uploadDataFile(file, selectedType as DataType, storeId)
      .then((res) => {
        setUploadHistory((prev) => [{
          id: res.job_id,
          fileName: file.name,
          type: selectedType,
          store: storeId,
          rows: 0,
          uploadedAt: new Date().toLocaleString("ko-KR"),
          status: "processing" as const,
        }, ...prev]);
      })
      .catch(() => { /* 알림 없이 실패 처리 */ })
      .finally(() => setUploading(false));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Data Integration</span>
          </div>
          <h1 className="ds-page-title">데이터 파이프라인 <span className="text-muted-foreground font-light">|</span> 업로드 센터</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black text-foreground uppercase tracking-widest italic">Sync Status: Active</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Upload Form */}
        <section className="lg:col-span-7 ds-card p-8 border-primary/5">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <h3 className="ds-section-title text-base flex items-center gap-3">
              <Upload className="h-5 w-5 text-primary" />
              Source File Upload
            </h3>
            <div className="flex bg-panel-soft p-1 rounded-xl">
              {typeTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                    selectedType === tab.value ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Column Guide */}
            <div className="p-6 ds-ai-panel border-none shadow-none">
              <p className="ds-eyebrow !text-[9px] mb-4 opacity-60">Required Schema Guide</p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {guide.required.map((col) => (
                    <span key={col} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-black uppercase italic shadow-sm">{col}*</span>
                  ))}
                  {guide.optional.map((col) => (
                    <span key={col} className="px-3 py-1.5 rounded-lg bg-panel-soft border border-border text-muted-foreground font-mono text-[10px] font-black uppercase italic">{col}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div
              className="rounded-[2.5rem] border-2 border-dashed border-border bg-panel-soft/30 p-16 text-center hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
            >
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-sm font-black text-foreground italic uppercase tracking-widest">Drop CSV or XLSX here</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-2 opacity-60">MAX FILE SIZE: 50MB</p>
              <button disabled={uploading} className="ds-button ds-button-primary h-10 px-8 mt-10 uppercase tracking-widest font-black text-[10px] disabled:opacity-50">
                {uploading ? "Uploading..." : "Browse Local Files"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="ds-eyebrow !text-[9px] ml-1">Target Node</label>
                <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="ds-input w-full bg-panel-soft border-none font-black text-xs uppercase italic">
                  <option>Global Sync</option>
                  {storeNames.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="ds-eyebrow !text-[9px] ml-1">Data Period</label>
                <input type="month" defaultValue="2026-03" className="ds-input w-full bg-panel-soft border-none font-black text-xs" />
              </div>
            </div>

            <button className="ds-button ds-button-primary w-full bg-ai-gradient border-none h-14 !rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-[0.3em] font-black">Commit to Pipeline</button>
          </div>
        </section>

        {/* Preview / History */}
        <div className="lg:col-span-5 space-y-8">
          <article className="ds-card p-8 border-primary/5 flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
              <h3 className="ds-section-title text-base flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Data Preview
              </h3>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase">Top 10 Nodes</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center ds-glass rounded-[2rem] border-dashed">
              <Database className="h-10 w-10 text-muted-foreground opacity-10 mb-4" />
              <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest italic">No Source Selected</p>
            </div>
          </article>

          <article className="ds-card p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-muted-foreground" />
                <h3 className="ds-section-title text-base uppercase tracking-widest italic">Sync History</h3>
              </div>
              <button className="ds-button ds-button-ghost !h-10 !w-10 !p-0"><RefreshCcw className="h-4 w-4 text-primary" /></button>
            </div>

            <div className="space-y-3">
              {uploadHistory.map((row) => (
                <div key={row.id} className="p-4 bg-panel-soft/30 rounded-2xl border border-border/40 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      row.status === "completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground truncate uppercase italic">{row.fileName}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1 italic">{row.uploadedAt} · {row.rows.toLocaleString()} Rows</p>
                    </div>
                  </div>
                  <span className={cn(
                    "ds-badge font-mono italic",
                    row.status === "completed" ? "ds-badge-success" : "ds-badge-danger"
                  )}>{row.status}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
