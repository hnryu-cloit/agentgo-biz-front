import type React from "react";
import { AlertOctagon, TrendingUp, CheckCircle2, Clock } from "lucide-react";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">본사 관제</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">이상 경보 상세</h2>
            <p className="mt-1 text-base text-slate-500">경보 원인, 권고 조치, 처리 타임라인을 확인합니다.</p>
          </div>
          <div className="rounded-xl bg-[#EEF4FF] p-3">
            <AlertOctagon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </section>

      {/* Alert Status */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 border-l-4 border-l-red-400">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-700">P0 경보</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">A매장 결제 이상 탐지</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            <span className="font-medium text-slate-700">탐지 시각</span>
            &nbsp;2026-03-05 14:23
          </span>
          <span className="text-slate-300">·</span>
          <span className="font-medium text-slate-700">상태</span>
          <span className="rounded border border-[#DCE4F3] bg-[#F7FAFF] px-2 py-0.5 text-xs font-medium text-slate-600">
            처리 중
          </span>
        </div>
      </section>

      {/* Cause + Actions */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Cause Analysis */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            원인 분석
          </h4>
          <div className="mt-5 flex-1 space-y-5">
            {causes.map((cause) => (
              <div key={cause.rank}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {cause.rank}순위&nbsp;
                    <span className="text-slate-400">({cause.percent}%)</span>
                    &nbsp;{cause.title}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${cause.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Recommended Actions */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-slate-400" />
            권고 조치
          </h4>
          <ul className="mt-5 flex-1 space-y-3">
            {actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F8FAFF]">
              에스컬레이션
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              조치 완료
            </button>
          </div>
        </article>

      </section>

      {/* Timeline */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Clock className="h-5 w-5 text-slate-400" />
          처리 타임라인
        </h4>
        <div className="mt-6 space-y-0 pl-1">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Dot + Line */}
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                  event.done
                    ? "border-primary bg-primary"
                    : "border-[#DCE4F3] bg-white"
                }`} />
                {idx < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-[#DCE4F3] my-1" />
                )}
              </div>
              {/* Content */}
              <div className={`pb-5 ${idx === timeline.length - 1 ? "pb-0" : ""}`}>
                <p className={`text-sm font-medium ${event.done ? "text-slate-900" : "text-slate-400"}`}>
                  {event.desc}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
