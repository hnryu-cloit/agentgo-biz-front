import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { getAlert, getAlerts, updateAlert } from "@/services/hq";
import type { AlertResponse, AlertStatus } from "@/types/api";

export const AlertDetailPage: React.FC = () => {
  const [alert, setAlert] = useState<AlertResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    getAlerts()
      .then(async (alerts) => {
        if (!alive) return;
        const first = alerts[0];
        if (!first) {
          setAlert(null);
          return;
        }
        const detail = await getAlert(first.id);
        if (!alive) return;
        setAlert(detail);
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "이상 경보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const causes = useMemo(() => {
    if (!alert) return [];
    return [
      { rank: 1, percent: 60, title: alert.title },
      { rank: 2, percent: 25, title: alert.description },
      { rank: 3, percent: 15, title: `${alert.store_id} 운영 지표 추가 점검 필요` },
    ];
  }, [alert]);

  const timeline = useMemo(() => {
    if (!alert) return [];
    return [
      { time: new Date(alert.detected_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), desc: `${alert.store_id} 이상 징후 감지`, done: true },
      { time: new Date(alert.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), desc: "HQ 경보 생성", done: true },
      { time: new Date(alert.updated_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), desc: `현재 상태: ${alert.status}`, done: alert.status !== "open" },
    ];
  }, [alert]);

  const actions = useMemo(() => {
    if (!alert) return [];
    return [
      `${alert.store_id} 현장 확인 및 원인 파악`,
      "이상 징후 관련 원천 데이터 재확인",
      "조치 결과를 본사 경보 상태에 반영",
    ];
  }, [alert]);

  const nextStatus: AlertStatus = alert?.status === "open" ? "acknowledged" : "resolved";

  const handleUpdateStatus = async () => {
    if (!alert) return;
    setIsUpdating(true);
    try {
      const updated = await updateAlert(alert.id, {
        status: nextStatus,
        resolution_comment: nextStatus === "resolved" ? "프론트 상세 화면에서 조치 완료 보고" : "프론트 상세 화면에서 확인 처리",
      });
      setAlert(updated);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="이상 경보 상세를 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="이상 경보를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  if (!alert) {
    return <EmptyState title="활성화된 이상 경보가 없습니다" description="현재 조회 가능한 경보 데이터가 없습니다." />;
  }

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
        <h3 className="text-xl font-bold text-foreground">{alert.title}</h3>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(alert.detected_at).toLocaleString("ko-KR")}</span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600 border border-amber-100">{alert.status}</span>
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
          <button
            onClick={() => void handleUpdateStatus()}
            disabled={isUpdating || alert.status === "resolved"}
            className="w-full mt-6 bg-primary text-white py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#2356e0] disabled:opacity-50"
          >
            {isUpdating ? "상태 반영 중..." : alert.status === "resolved" ? "조치 완료" : nextStatus === "acknowledged" ? "확인 처리" : "조치 완료 보고"}
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
