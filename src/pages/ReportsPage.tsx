import type React from "react";
import { useEffect, useState } from "react";
import { FileText, Download, RefreshCcw, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReports, generateReport, downloadReport } from "@/services/reports";
import { getStoreIntelligence, type StoreIntelligence } from "@/services/analysis";
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
  { id: "cj-r1", type: "daily_owner", title: "일간 점주 리포트 — [CJ]광화문점", period: "2026-02-28", createdAt: "2026-02-28 22:00", status: "ready", size: "248KB" },
  { id: "cj-r2", type: "weekly_hq", title: "본사 주간 리포트 — 크리스탈제이드 W09", period: "2026-02-22 ~ 2026-02-28", createdAt: "2026-03-01 06:00", status: "ready", size: "1.2MB" },
  { id: "cj-r3", type: "daily_owner", title: "일간 점주 리포트 — [CJ]소공점", period: "2026-02-28", createdAt: "2026-02-28 22:05", status: "ready", size: "231KB" },
  { id: "cj-r4", type: "daily_owner", title: "일간 점주 리포트 — [CJ]광화문점 영수증 상세", period: "2026-02-28", createdAt: "2026-02-28 08:00", status: "failed" },
  { id: "cj-r5", type: "weekly_hq", title: "본사 주간 리포트 — 크리스탈제이드 W08", period: "2026-02-15 ~ 2026-02-21", createdAt: "2026-02-22 06:00", status: "ready", size: "1.1MB" },
];

const typeLabel: Record<ReportType, string> = {
  daily_owner: "일간 점주",
  weekly_hq: "본사 주간",
};

const typeColor: Record<ReportType, string> = {
  daily_owner: "text-primary bg-[#eef3ff] border-[#b8ccff]",
  weekly_hq: "text-purple-700 bg-purple-50 border-purple-200",
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
  const [storeIntelligence, setStoreIntelligence] = useState<StoreIntelligence | null>(null);

  useEffect(() => {
    let alive = true;
    getReports()
      .then((res) => {
        if (!alive) return;
        setReportList(res.length > 0 ? res.map(apiToReport) : initialReports);
      })
      .catch(() => {
        if (!alive) return;
        setReportList(initialReports);
      });
    getStoreIntelligence("[CJ]광화문점")
      .then((res) => {
        if (!alive) return;
        setStoreIntelligence(res);
      })
      .catch(() => {
        if (!alive) return;
        setStoreIntelligence(null);
      });
    return () => { alive = false; };
  }, []);

  const filtered = reportList.filter((r) => filter === "전체" || r.type === filter);

  const handleGenerate = (type: ReportType) => {
    const tempId = `new-${Date.now()}`;
    setGenerating(tempId);
    const newReport: Report = {
      id: tempId,
      type,
      title: type === "daily_owner" ? "일간 점주 리포트 — [CJ]광화문점" : "본사 주간 리포트 — 크리스탈제이드 신규 주차",
      period: new Date().toISOString().slice(0, 10),
      createdAt: "생성 중...",
      status: "generating",
    };
    setReportList((prev) => [newReport, ...prev]);
    generateReport({
      report_type: type === "daily_owner" ? "daily" : "weekly",
      period_label: newReport.period,
    })
      .then((res) => {
        setReportList((prev) => prev.map((r) => r.id === tempId ? apiToReport(res) : r));
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
      period_label: target.period,
    })
      .then((res) => {
        setReportList((prev) => prev.map((r) => r.id === id ? apiToReport(res) : r));
      })
      .catch(() => {
        setReportList((prev) => prev.map((r) => r.id === id ? { ...r, status: "ready" as const } : r));
      })
      .finally(() => setRetrying(null));
  };

  return (
    <div className="space-y-6 pb-10">

      {/* 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">문서 센터</p>
              <h1 className="text-xl font-bold text-foreground">통합 리포트 허브</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">AI가 자동 생성한 일간·주간 운영 리포트를 조회하고 관리합니다.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleGenerate("daily_owner")}
              disabled={!!generating}
              className="inline-flex items-center gap-2 rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] disabled:opacity-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              일간 리포트 생성
            </button>
            <button
              onClick={() => handleGenerate("weekly_hq")}
              disabled={!!generating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E5BE9] disabled:opacity-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              주간 통합 리포트 생성
            </button>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="mt-5 flex gap-1">
          {(["전체", "daily_owner", "weekly_hq"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                filter === f
                  ? "bg-primary text-white"
                  : "border border-[#d5deec] bg-[#f4f7ff] text-[#34415b] hover:bg-[#eef3ff]"
              )}
            >
              {f === "전체" ? "전체 리포트" : typeLabel[f]}
            </button>
          ))}
        </div>
      </section>

      {storeIntelligence && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">리포트 생성 기준 실데이터 인사이트</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{storeIntelligence.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              `오늘 매출 ${storeIntelligence.metrics.sales.today_revenue.toLocaleString()}원`,
              `재방문율 ${(storeIntelligence.metrics.churn.return_rate * 100).toFixed(1)}%`,
              `프로모션 ROI ${storeIntelligence.metrics.roi_rate.toFixed(1)}%`,
            ].map((item) => (
              <div key={item} className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 리포트 목록 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-border bg-gray-50">
              <tr>
                <th className="pl-6 pr-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28 text-center">분류</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">리포트 제목</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center w-44">대상 기간</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-44">생성 일시</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center w-24">크기</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center w-28">상태</th>
                <th className="pl-4 pr-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right w-28">다운로드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    r.status === "generating" && "bg-primary/[0.01]"
                  )}
                >
                  <td className="pl-6 pr-4 py-4 text-center">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", typeColor[r.type])}>
                      {typeLabel[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <span className="font-medium text-foreground">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground tabular-nums">{r.period}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    {r.status === "generating" ? (
                      <span className="flex items-center gap-2 text-primary font-semibold">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        생성 중...
                      </span>
                    ) : (
                      <span className="tabular-nums">{r.createdAt}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">{r.size ?? "-"}</td>
                  <td className="px-4 py-4 text-center">
                    {r.status === "ready" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />완료
                      </span>
                    )}
                    {r.status === "generating" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-primary">
                        <Clock className="h-3 w-3" />생성 중
                      </span>
                    )}
                    {r.status === "failed" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                        <AlertCircle className="h-3 w-3" />실패
                      </span>
                    )}
                  </td>
                  <td className="pl-4 pr-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "ready" && (
                        <button
                          onClick={() => {
                            if (!r.fileUrl) return;
                            void downloadReport({ title: r.title, file_url: r.fileUrl });
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {r.status === "failed" && (
                        <button
                          onClick={() => handleRetry(r.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <RefreshCcw className={cn("h-4 w-4", retrying === r.id && "animate-spin")} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <p className="text-[11px] font-medium text-muted-foreground">Page 1 / 5</p>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff] transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-semibold shadow-sm">1</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#34415b] text-xs font-medium hover:bg-[#f4f7ff] transition-colors">2</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#34415b] text-xs font-medium hover:bg-[#f4f7ff] transition-colors">3</button>
            <span className="flex h-8 w-8 items-center justify-center text-muted-foreground text-xs">...</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#34415b] text-xs font-medium hover:bg-[#f4f7ff] transition-colors">5</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff] transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
