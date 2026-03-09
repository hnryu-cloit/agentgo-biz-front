import type React from "react";
import { useState } from "react";
import { FileText, Download, RefreshCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
  daily_owner: "border-[#BFD4FF] bg-[#EEF4FF] text-primary",
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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">리포트</h2>
            <p className="mt-1 text-sm text-slate-500">자동 생성된 일간·주간 리포트를 조회하고 다운로드합니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerate("daily_owner")}
              disabled={!!generating}
              className="flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#F8FAFF] disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              일간 리포트 생성
            </button>
            <button
              onClick={() => handleGenerate("weekly_hq")}
              disabled={!!generating}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              주간 리포트 생성
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(["전체", "daily_owner", "weekly_hq"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1.5 text-sm font-semibold text-primary"
                  : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-sm text-slate-600"
              }
            >
              {f === "전체" ? "전체" : typeLabel[f]}
            </button>
          ))}
        </div>
      </section>

      {/* Report List */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">리포트명</th>
                <th className="px-4 py-3">대상 기간</th>
                <th className="px-4 py-3">생성 일시</th>
                <th className="px-4 py-3">크기</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${typeColor[r.type]}`}>
                      {typeLabel[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.title}</td>
                  <td className="px-4 py-3 text-slate-500">{r.period}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.status === "generating" ? (
                      <span className="flex items-center gap-1.5 text-primary">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        생성 중...
                      </span>
                    ) : (
                      r.createdAt
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.size ?? "-"}</td>
                  <td className="px-4 py-3">
                    {r.status === "ready" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />완료
                      </span>
                    )}
                    {r.status === "generating" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Clock className="h-3.5 w-3.5" />생성중
                      </span>
                    )}
                    {r.status === "failed" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />실패
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "ready" && (
                      <button className="flex items-center gap-1 rounded border border-[#D6E0F0] bg-white px-2 py-1 text-xs text-slate-700 hover:bg-[#F8FAFF] ml-auto">
                        <Download className="h-3 w-3" />
                        다운로드
                      </button>
                    )}
                    {r.status === "failed" && (
                      <button
                        onClick={() => handleRetry(r.id)}
                        disabled={retrying === r.id}
                        className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 ml-auto disabled:opacity-50"
                      >
                        <RefreshCcw className={`h-3 w-3 ${retrying === r.id ? "animate-spin" : ""}`} />
                        재시도
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