import type React from "react";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const causes = [
  { rank: 1, percent: 58, title: "[CJ]광화문점 전일 대비 매출 급감" },
  { rank: 2, percent: 27, title: "디너 시간대 객수 둔화" },
  { rank: 3, percent: 15, title: "영수증 리소스 업로드 실패 여파" },
];

const timeline = [
  { time: "21:30", desc: "[CJ]광화문점 매출 하락 패턴 감지", done: true },
  { time: "21:35", desc: "HQ 경보 생성", done: true },
  { time: "21:40", desc: "SV 현장 확인 요청", done: true },
  { time: "21:55", desc: "원인 분석 및 액션 보드 작성", done: false },
];

const actions = [
  "[CJ]광화문점 점주 유선 확인 및 디너 객수 저하 사유 파악",
  "receipt_listing 업로드 실패 건 재처리",
  "크리스탈제이드 재방문 쿠폰 발송 후보군 점검",
];

export const AlertDetailPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div>
          <p className="text-sm font-semibold text-primary">본사 관제</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">이상 경보 상세</h2>
          <p className="mt-1 text-base text-muted-foreground">탐지된 이상 징후의 원인과 대응 조치를 확인합니다.</p>
        </div>
      </section>

      {/* Alert Status Card */}
      <section className="rounded-2xl border border-border/90 bg-card p-6 border-l-4 border-l-red-500 shadow-elevated">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-600 uppercase">CJ Warning</span>
        </div>
        <h3 className="text-xl font-bold text-foreground">[CJ]광화문점 매출 하락 감지</h3>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 21:30</span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600 border border-amber-100">처리 중</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 원인 분석 */}
        <article className="rounded-2xl border border-border/90 bg-card p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="text-lg font-bold text-foreground">원인 분석</h4>
          </div>
          <div className="space-y-5">
            {causes.map((cause) => (
              <div key={cause.rank} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[#34415b]">{cause.rank}순위: {cause.title}</span>
                  <span className="text-primary font-bold">{cause.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${cause.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* 권고 조치 */}
        <article className="rounded-2xl border border-border/90 bg-card p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h4 className="text-lg font-bold text-foreground">권고 조치</h4>
          </div>
          <ul className="space-y-3">
            {actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[#f4f7ff] p-3 text-sm font-medium text-[#34415b]">
                <span className="text-primary font-bold">{idx + 1}</span>
                {action}
              </li>
            ))}
          </ul>
          <button className="w-full mt-6 bg-primary text-white py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#2356e0]">
            조치 완료 보고
          </button>
        </article>
      </div>

      {/* 타임라인 */}
      <section className="rounded-2xl border border-border/90 bg-card p-6 shadow-elevated">
        <h4 className="text-lg font-bold text-foreground mb-6">처리 타임라인</h4>
        <div className="space-y-0 pl-1">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn("h-3 w-3 rounded-full border-2", event.done ? "bg-primary border-primary" : "bg-card border-[var(--border)]")} />
                {idx < timeline.length - 1 && <div className="w-px flex-1 bg-[var(--muted)] my-1" />}
              </div>
              <div className={`pb-6 ${idx === timeline.length - 1 ? "pb-0" : ""}`}>
                <p className={cn("text-sm font-medium", event.done ? "text-foreground" : "text-[var(--subtle-foreground)]")}>{event.desc}</p>
                <p className="text-[11px] font-bold text-[var(--subtle-foreground)] mt-1">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
