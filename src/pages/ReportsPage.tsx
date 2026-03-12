import type React from "react";
import { useState } from "react";
import { FileText, Download, RefreshCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
};

const reports: Report[] = [
  { id: "r1", type: "daily_owner", title: "일간 점주 리포트 — A매장", period: "2026-03-08", createdAt: "2026-03-09 07:00", status: "ready", size: "248KB" },
  { id: "r2", type: "weekly_hq", title: "본사 주간 리포트 — W10", period: "2026-03-02 ~ 2026-03-08", createdAt: "2026-03-09 06:00", status: "ready", size: "1.2MB" },
  { id: "r3", type: "daily_owner", title: "일간 점주 리포트 — A매장", period: "2026-03-07", createdAt: "2026-03-08 07:00", status: "ready", size: "231KB" },
  { id: "r4", type: "daily_owner", title: "일간 점주 리포트 — A매장", period: "2026-03-06", createdAt: "2026-03-07 07:04", status: "failed", size: undefined },
  { id: "r5", type: "weekly_hq", title: "본사 주간 리포트 — W09", period: "2026-02-23 ~ 2026-03-01", createdAt: "2026-03-02 06:00", status: "ready", size: "1.1MB" },
];

const typeLabel: Record<ReportType, string> = {
  daily_owner: "일간 점주",
  weekly_hq: "본사 주간",
};

const typeColor: Record<ReportType, string> = {
  daily_owner: "border-[#BFD4FF] bg-[#EEF4FF] text-[#2454C8]",
  weekly_hq: "border-purple-200 bg-purple-50 text-purple-700",
};

export const ReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<ReportType | "전체">("전체");
  const [generating, setGenerating] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [reportList, setReportList] = useState(reports);

  const filtered = reportList.filter((r) => filter === "전체" || r.type === filter);

  const handleGenerate = (type: ReportType) => {
    const id = `new-${Date.now()}`;
    setGenerating(id);
    const newReport: Report = {
      id,
      type,
      title: type === "daily_owner" ? "일간 점주 리포트 — A매장" : "본사 주간 리포트 — W11",
      period: "2026-03-09",
      createdAt: "생성 중...",
      status: "generating",
    };
    setReportList((prev) => [newReport, ...prev]);

    setTimeout(() => {
      setReportList((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "ready", createdAt: "2026-03-09 " + new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), size: "256KB" } : r
        )
      );
      setGenerating(null);
    }, 2500);
  };

  const handleRetry = (id: string) => {
    setRetrying(id);
    setTimeout(() => {
      setReportList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "ready", createdAt: "2026-03-07 07:08", size: "228KB" } : r))
      );
      setRetrying(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">문서 센터</p>
            <h2 className="text-2xl font-bold text-slate-900">통합 리포트 허브</h2>
            <p className="mt-1 text-base text-slate-500">AI가 자동 생성한 일간·주간 운영 리포트를 조회하고 관리합니다.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleGenerate("daily_owner")}
              disabled={!!generating}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
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

        {/* Filter */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-1.5 w-fit shadow-sm">
          {(["전체", "daily_owner", "weekly_hq"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
                filter === f
                  ? "bg-white text-[#2454C8] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f === "전체" ? "전체 리포트" : typeLabel[f]}
            </button>
          ))}
        </div>
      </section>

      {/* Report List */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold text-center">분류</th>
                <th className="px-4 py-3 font-bold">리포트 제목</th>
                <th className="px-4 py-3 font-bold text-center">대상 기간</th>
                <th className="px-4 py-3 font-bold">생성 일시</th>
                <th className="px-4 py-3 font-bold text-center">파일 크기</th>
                <th className="px-4 py-3 font-bold text-center">상태</th>
                <th className="px-4 py-3 text-right font-bold">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className={cn(
                  "border-t border-border transition-colors hover:bg-slate-50/50 font-medium",
                  r.status === "generating" ? "bg-primary/[0.01]" : ""
                )}>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-black shadow-sm",
                      typeColor[r.type]
                    )}>
                      {typeLabel[r.type].replace(" ", "").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-300" />
                      <span className="font-bold text-slate-800">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-500 font-mono text-xs">{r.period}</td>
                  <td className="px-4 py-4 text-slate-500 text-xs">
                    {r.status === "generating" ? (
                      <span className="flex items-center gap-2 text-primary font-bold animate-pulse">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        GENERATING...
                      </span>
                    ) : (
                      <span className="font-mono">{r.createdAt}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-400 font-mono text-xs">{r.size ?? "-"}</td>
                  <td className="px-4 py-4 text-center">
                    {r.status === "ready" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />READY
                      </span>
                    )}
                    {r.status === "generating" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-primary border border-blue-100 shadow-sm">
                        <Clock className="h-3 w-3" />RUNNING
                      </span>
                    )}
                    {r.status === "failed" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600 border border-red-100 shadow-sm">
                        <AlertCircle className="h-3 w-3" />FAILED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "ready" && (
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-primary/30">
                          <Download className="h-3.5 w-3.5" />
                          다운로드
                        </button>
                      )}
                      {r.status === "failed" && (
                        <button
                          onClick={() => handleRetry(r.id)}
                          disabled={retrying === r.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 disabled:opacity-50"
                        >
                          <RefreshCcw className={cn("h-3.5 w-3.5", retrying === r.id ? "animate-spin" : "")} />
                          재시도하기
                        </button>
                      )}
                    </div>
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
