import type React from "react";
import { useEffect, useState } from "react";
import { FileText, Download, RefreshCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReports, generateReport, downloadReport } from "@/services/reports";
import type { ReportResponse } from "@/types/api";

type ReportType = "daily_owner" | "weekly_hq";
type ReportStatus = "ready" | "generating" | "failed";

type Report = {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  createdAt: string;
  status: ReportStatus;
  size?: string;
  fileUrl?: string | null;
};

const initialReports: Report[] = [
  { id: "r1", type: "daily_owner", title: "일간 점주 리포트 — 강남역점", period: "2026-03-08", createdAt: "2026-03-09 07:00", status: "ready", size: "248KB" },
  { id: "r2", type: "weekly_hq", title: "본사 주간 리포트 — W10 (전체)", period: "2026-03-02 ~ 2026-03-08", createdAt: "2026-03-09 06:00", status: "ready", size: "1.2MB" },
  { id: "r3", type: "daily_owner", title: "일간 점주 리포트 — 홍대점", period: "2026-03-07", createdAt: "2026-03-08 07:00", status: "ready", size: "231KB" },
  { id: "r4", type: "daily_owner", title: "일간 점주 리포트 — 역삼점", period: "2026-03-06", createdAt: "2026-03-07 07:04", status: "failed", size: undefined },
  { id: "r5", type: "weekly_hq", title: "본사 주간 리포트 — W09 (전체)", period: "2026-02-23 ~ 2026-03-01", createdAt: "2026-03-02 06:00", status: "ready", size: "1.1MB" },
];

const typeLabel: Record<ReportType, string> = {
  daily_owner: "일간 점주",
  weekly_hq: "본사 주간",
};

const typeColor: Record<ReportType, string> = {
  daily_owner: "border-[#b8ccff] bg-[#eef3ff] text-[#2f66ff]",
  weekly_hq: "border-purple-200 bg-purple-50 text-purple-700",
};

function apiToReport(r: ReportResponse): Report {
  return {
    id: r.id,
    type: (r.report_type === "daily" ? "daily_owner" : "weekly_hq") as ReportType,
    title: r.title,
    period: r.period_label,
    createdAt: r.created_at.replace("T", " ").slice(0, 16),
    status: r.status === "completed" ? "ready" : r.status === "generating" ? "generating" : "failed",
    fileUrl: r.file_url,
  };
}

export const ReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<ReportType | "전체">("전체");
  const [generating, setGenerating] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [reportList, setReportList] = useState(initialReports);

  // API 연결: 리포트 목록 로드
  useEffect(() => {
    let alive = true;
    getReports()
      .then((res) => {
        if (!alive || res.items.length === 0) return;
        setReportList(res.items.map(apiToReport));
      })
      .catch(() => { /* mock 유지 */ });
    return () => { alive = false; };
  }, []);

  const filtered = reportList.filter((r) => filter === "전체" || r.type === filter);

  const handleGenerate = (type: ReportType) => {
    const tempId = `new-${Date.now()}`;
    setGenerating(tempId);
    const newReport: Report = {
      id: tempId,
      type,
      title: type === "daily_owner" ? "일간 점주 리포트 — 강남역점" : "본사 주간 리포트 — W11 (전체)",
      period: new Date().toISOString().slice(0, 10),
      createdAt: "생성 중...",
      status: "generating",
    };
    setReportList((prev) => [newReport, ...prev]);

    generateReport({
      report_type: type === "daily_owner" ? "daily" : "weekly",
      store_id: "default",
      period_label: newReport.period,
    })
      .then((res) => {
        setReportList((prev) =>
          prev.map((r) => r.id === tempId ? apiToReport(res) : r)
        );
      })
      .catch(() => {
        setReportList((prev) =>
          prev.map((r) =>
            r.id === tempId
              ? { ...r, status: "ready" as const, createdAt: new Date().toLocaleString("ko-KR") }
              : r
          )
        );
      })
      .finally(() => setGenerating(null));
  };

  const handleRetry = (id: string) => {
    const target = reportList.find((r) => r.id === id);
    if (!target) return;
    setRetrying(id);
    generateReport({
      report_type: target.type === "daily_owner" ? "daily" : "weekly",
      store_id: "default",
      period_label: target.period,
    })
      .then((res) => {
        setReportList((prev) => prev.map((r) => r.id === id ? apiToReport(res) : r));
      })
      .catch(() => {
        setReportList((prev) =>
          prev.map((r) => r.id === id ? { ...r, status: "ready" as const } : r)
        );
      })
      .finally(() => setRetrying(null));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">문서 센터</p>
            <h2 className="text-2xl font-bold text-foreground">통합 리포트 허브</h2>
            <p className="mt-1 text-base text-muted-foreground">AI가 자동 생성한 일간·주간 운영 리포트를 조회하고 관리합니다.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleGenerate("daily_owner")}
              disabled={!!generating}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-card px-5 py-2.5 text-sm font-bold text-[#4a5568] shadow-sm transition-all hover:bg-[var(--panel-soft)] disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              일간 리포트 생성
            </button>
            <button
              onClick={() => handleGenerate("weekly_hq")}
              disabled={!!generating}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <FileText className="h-4 w-4" />
              주간 통합 리포트 생성
            </button>
          </div>
        </div>

        {/* Filter Area */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1.5 w-fit shadow-sm">
          {(["전체", "daily_owner", "weekly_hq"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
                filter === f
                  ? "bg-card text-[#2f66ff] shadow-sm"
                  : "text-[var(--subtle-foreground)] hover:text-[#4a5568]"
              )}
            >
              {f === "전체" ? "전체 리포트" : typeLabel[f]}
            </button>
          ))}
        </div>
      </section>

      {/* Report List Section */}
      <section className="app-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-32">분류</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">리포트 제목</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-40">대상 기간</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-48">생성 일시</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">파일 크기</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-32">상태</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider text-right w-32">다운로드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id} className={cn(
                  "group transition-all hover:bg-[var(--surface-hover)]/70 font-medium",
                  r.status === "generating" ? "bg-primary/[0.01]" : ""
                )}>
                  <td className="pl-8 pr-4 py-4 text-center border-r border-[var(--border)]/40">
                    <span className={cn(
                      "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black shadow-sm",
                      typeColor[r.type]
                    )}>
                      {typeLabel[r.type].replace(" ", "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#b0bdd4]" />
                      <span className="font-bold text-[#1a2138]">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-muted-foreground font-mono text-xs border-r border-[var(--border)]/40">{r.period}</td>
                  <td className="px-4 py-4 text-muted-foreground text-xs border-r border-[var(--border)]/40">
                    {r.status === "generating" ? (
                      <span className="flex items-center gap-2 text-primary font-bold animate-pulse">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        GENERATING...
                      </span>
                    ) : (
                      <span className="font-mono">{r.createdAt}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-[var(--subtle-foreground)] font-mono text-xs border-r border-[var(--border)]/40">{r.size ?? "-"}</td>
                  <td className="px-4 py-4 text-center border-r border-[var(--border)]/40">
                    {r.status === "ready" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />READY
                      </span>
                    )}
                    {r.status === "generating" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary bg-blue-50 px-2 py-1 rounded-full border border-blue-100 shadow-sm">
                        <Clock className="h-3 w-3" />RUNNING
                      </span>
                    )}
                    {r.status === "failed" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 shadow-sm">
                        <AlertCircle className="h-3 w-3" />FAILED
                      </span>
                    )}
                  </td>
                  <td className="pl-4 pr-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "ready" && (
                        <button
                          onClick={() => {
                            if (!r.fileUrl) return;
                            void downloadReport({
                              title: r.title,
                              file_url: r.fileUrl,
                            });
                          }}
                          className="p-2 rounded-xl bg-card border border-[#d5deec] text-[var(--subtle-foreground)] hover:text-primary hover:border-primary/20 shadow-sm transition-all"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {r.status === "failed" && (
                        <button
                          onClick={() => handleRetry(r.id)}
                          className="p-2 rounded-xl bg-card border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all"
                        >
                          <RefreshCcw className={cn("h-4 w-4", retrying === r.id ? "animate-spin" : "")} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Standard Pagination Area */}
        <div className="px-8 py-4 bg-card border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Page 1 of 5</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all disabled:opacity-30 shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">2</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">3</button>
            <span className="h-8 w-8 flex items-center justify-center text-[#b0bdd4] text-xs font-bold">...</span>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">5</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
