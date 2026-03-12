import type React from "react";
import { AlertOctagon, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const causes = [
  { rank: 1, percent: 62, title: "마감시간 직전 취소 집중" },
  { rank: 2, percent: 28, title: "특정 메뉴 품절 이슈" },
  { rank: 3, percent: 10, title: "POS 네트워크 불안정" },
];

const actions = [
  "해당 매장 즉시 연락 및 상황 파악",
  "구역 담당 수퍼바이저 에스컬레이션",
  "이미 처리된 마감시간 취소 확인",
];

const timeline = [
  { time: "14:23", desc: "이상 탐지 자동 생성", done: true },
  { time: "14:23", desc: "AI 원인 분석 완료", done: true },
  { time: "14:31", desc: "담당 수퍼바이저 경보 확인", done: true },
  { time: "14:35", desc: "SV 에스컬레이션 발송", done: false },
];

export const AlertDetailPage: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">본사 관제</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">이상 경보 상세</h2>
            <p className="mt-1 text-base text-slate-500">경보 원인, 권고 조치, 처리 타임라인을 확인합니다.</p>
          </div>
          <div className="rounded-xl bg-[#EEF4FF] p-3 shadow-sm">
            <AlertOctagon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </section>

      {/* Alert Status */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 border-l-4 border-l-red-400 shadow-elevated transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">P0 Emergency Alert</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">A매장 결제 이상 탐지</h3>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">탐지 시각</span>
            <span>2026-03-05 14:23</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-700">상태</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 shadow-sm">
              처리 중
            </span>
          </div>
        </div>
      </section>

      {/* Cause + Actions */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* Cause Analysis */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-1.5">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">원인 분석</h4>
          </div>
          <div className="flex-1 space-y-6">
            {causes.map((cause) => (
              <div key={cause.rank} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {cause.rank}순위&nbsp;
                    <span className="text-slate-400 font-medium">({cause.percent}%)</span>
                  </span>
                  <span className="text-slate-900 font-bold">{cause.title}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                  <div
                    className="h-full rounded-full bg-primary shadow-sm transition-all duration-1000"
                    style={{ width: `${cause.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Recommended Actions */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-1.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">권고 조치</h4>
          </div>
          <ul className="flex-1 space-y-3.5">
            {actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3 shadow-sm transition-colors hover:border-primary/30">
                <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
                  <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                </div>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-[#F8FAFF] shadow-sm">
              에스컬레이션
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md">
              조치 완료
            </button>
          </div>
        </article>

      </section>

      {/* Timeline */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-slate-100 p-1.5">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">처리 타임라인</h4>
        </div>
        <div className="space-y-0 pl-2">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex gap-5">
              {/* Dot + Line */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2 shadow-sm transition-all duration-500",
                  event.done
                    ? "border-primary bg-primary"
                    : "border-[#DCE4F3] bg-white"
                )} />
                {idx < timeline.length - 1 && (
                  <div className={cn(
                    "w-0.5 flex-1 my-1 transition-colors duration-500",
                    event.done ? "bg-primary/30" : "bg-slate-100"
                  )} />
                )}
              </div>
              {/* Content */}
              <div className={`pb-6 ${idx === timeline.length - 1 ? "pb-0" : ""}`}>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    event.done ? "text-slate-900" : "text-slate-400"
                  )}>
                    {event.desc}
                  </p>
                  {event.done && (
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">DONE</span>
                  )}
                </div>
                <p className="mt-1 text-xs font-bold text-slate-400 font-mono">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
