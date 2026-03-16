import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart2, DollarSign, Megaphone, RefreshCw, ShoppingBag, Sparkles, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCustomerInsights, getOwnerActions, getOwnerDashboard, updateActionStatus, type CustomerInsights, type OwnerDashboard } from "@/services/owner";
import type { ActionResponse, ActionStatus } from "@/types/api";

const emptyDashboard: OwnerDashboard = {
  store_key: null,
  store_name: "매장",
  latest_date: null,
  today_revenue: 0,
  revenue_vs_yesterday: 0,
  transaction_count: 0,
  avg_order_value: 0,
  cancel_rate: 0,
  peak_hour: null,
  kpi_trend: [],
};

const actionTemplates = [
  {
    id: 1,
    level: "P0" as const,
    title: "객수 회복 프로모션 점검",
    why: "전일 대비 매출과 객수 흐름을 함께 확인해야 합니다.",
    impact: "비피크 시간대 매출 회복",
  },
  {
    id: 2,
    level: "P1" as const,
    title: "객단가 상향 메뉴 제안",
    why: "평균 객단가와 결제건수 조합을 기준으로 업셀링 포인트를 확인합니다.",
    impact: "객단가 개선",
  },
  {
    id: 3,
    level: "P1" as const,
    title: "환불 비중 점검",
    why: "취소율이 높아지면 운영 품질 이슈로 이어질 수 있습니다.",
    impact: "취소율 안정화",
  },
];

export const OwnerDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<OwnerDashboard>(emptyDashboard);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [actions, setActions] = useState<ActionResponse[]>([]);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getOwnerDashboard(), getOwnerActions()])
      .then(([response, actionResponse]) => {
        if (!alive) return;
        setDashboard(response);
        setActions(actionResponse);
        const key = response.store_key ?? undefined;
        return getCustomerInsights(key, 90);
      })
      .then((ins) => {
        if (!alive || !ins) return;
        setInsights(ins);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(emptyDashboard);
      });
    return () => {
      alive = false;
    };
  }, []);

  const trendMax = Math.max(...dashboard.kpi_trend.map((item) => item.revenue), 1);
  const achievementRate = dashboard.today_revenue > 0 ? Math.min(100, Math.round((dashboard.today_revenue / Math.max(dashboard.today_revenue - dashboard.revenue_vs_yesterday, 1)) * 100)) : 0;

  const actionBoard = useMemo(
    () => (
      actions.length > 0
        ? actions.map((action) => ({
            id: action.id,
            level: action.priority === "P0" ? "P0" : "P1",
            title: action.title,
            why: action.ai_basis || action.description,
            impact: action.expected_impact || "예상 효과 정보 없음",
            status: action.status,
          }))
        : actionTemplates.map((action) => ({
            ...action,
            id: String(action.id),
            status: "pending" as ActionStatus,
            why: action.id === 1
              ? `전일 대비 매출 변화는 ${dashboard.revenue_vs_yesterday >= 0 ? "+" : ""}${dashboard.revenue_vs_yesterday.toLocaleString()}원 입니다.`
              : action.id === 2
                ? `현재 평균 객단가는 ${dashboard.avg_order_value.toLocaleString()}원 입니다.`
                : `현재 취소율은 ${(dashboard.cancel_rate * 100).toFixed(2)}% 입니다.`,
          }))
    ),
    [actions, dashboard],
  );

  const completedCount = actionBoard.filter((action) => action.status === "executed").length;

  const handleActionStatus = async (actionId: string, status: ActionStatus) => {
    const previous = actions;
    setPendingActionId(actionId);
    setActions((current) => current.map((action) => (
      action.id === actionId ? { ...action, status } : action
    )));
    try {
      const updated = await updateActionStatus(actionId, { status });
      setActions((current) => current.map((action) => (
        action.id === actionId ? updated : action
      )));
    } catch {
      setActions(previous);
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">모닝 브리핑</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{dashboard.store_name} 최신 브리핑</p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-slate-400">{dashboard.latest_date ?? "데이터 없음"}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">전일 실적</p>
            <p className="mt-1 text-sm font-bold text-slate-900">매출 {dashboard.today_revenue.toLocaleString()}원</p>
            <p className={cn("text-xs", dashboard.revenue_vs_yesterday >= 0 ? "text-emerald-600" : "text-red-500")}>
              전일 대비 {dashboard.revenue_vs_yesterday >= 0 ? "+" : ""}{dashboard.revenue_vs_yesterday.toLocaleString()}원
            </p>
          </div>
          <div className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">운영 핵심</p>
            <p className="mt-1 text-sm font-bold text-slate-900">결제건수 {dashboard.transaction_count.toLocaleString()}건</p>
            <p className="text-xs text-emerald-600">평균 객단가 {dashboard.avg_order_value.toLocaleString()}원</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
            <p className="text-xs font-medium text-amber-700">주의 지표</p>
            <p className="mt-1 text-sm font-bold text-slate-900">취소율 {(dashboard.cancel_rate * 100).toFixed(2)}%</p>
            <p className="text-xs text-amber-600">매출 피크 포인트 {dashboard.peak_hour ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-[#CFE0FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2454C8]">
                {dashboard.store_name}
              </span>
              <span className="text-sm text-slate-400">최신 기준 {dashboard.latest_date ?? "-"}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">점주 대시보드</h2>
            <p className="mt-1 text-base text-slate-500">실제 resource 집계 기준으로 매장 운영 상태를 확인합니다.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI 예상 달성률 {achievementRate}%</p>
              <p className="text-xs text-slate-500">전일 흐름 기준 추정</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "매출", value: `${dashboard.today_revenue.toLocaleString()}원`, delta: dashboard.revenue_vs_yesterday >= 0 ? "상승" : "하락", tone: dashboard.revenue_vs_yesterday >= 0 ? "emerald" : "red", icon: DollarSign },
          { label: "결제건수", value: `${dashboard.transaction_count.toLocaleString()}건`, delta: dashboard.latest_date ?? "-", tone: "blue", icon: Users },
          { label: "평균 객단가", value: `${dashboard.avg_order_value.toLocaleString()}원`, delta: "AOV", tone: "blue", icon: ShoppingBag },
          { label: "취소율", value: `${(dashboard.cancel_rate * 100).toFixed(2)}%`, delta: dashboard.cancel_rate > 0.03 ? "주의" : "안정", tone: dashboard.cancel_rate > 0.03 ? "amber" : "emerald", icon: AlertTriangle },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className={cn("mt-1.5 text-sm font-medium", kpi.tone === "red" ? "text-red-600" : kpi.tone === "amber" ? "text-amber-600" : kpi.tone === "emerald" ? "text-emerald-600" : "text-slate-500")}>
                {kpi.delta}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">오늘의 운영 액션 보드</h3>
          <span className="ml-auto rounded border border-[#DCE4F3] bg-[#F7FAFF] px-2 py-0.5 text-xs font-medium text-slate-500">
            {completedCount}/{actionBoard.length} 완료
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {actionBoard.map((action) => (
            <article
              key={action.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                action.status === "executed" ? "border-[#BFD4FF] bg-[#EEF4FF]" : "border-[#DCE4F3] bg-[#F7FAFF]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded px-2 py-0.5 text-xs font-semibold text-white", action.level === "P0" ? "bg-red-500" : "bg-amber-500")}>
                      {action.level}
                    </span>
                    <p className="font-semibold text-slate-900">{action.title}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{action.why}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#CFE0FF] bg-white px-2.5 py-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-primary">{action.impact}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {action.status !== "executed" && actions.length > 0 ? (
                    <>
                      <button
                        onClick={() => handleActionStatus(action.id, "executed")}
                        disabled={pendingActionId === action.id}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9] disabled:opacity-50"
                      >
                        실행
                      </button>
                      <button
                        onClick={() => handleActionStatus(action.id, "deferred")}
                        disabled={pendingActionId === action.id}
                        className="rounded-lg border border-[#DCE4F3] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        보류
                      </button>
                    </>
                  ) : action.status === "executed" ? (
                    <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-emerald-600">
                      실행 완료
                    </span>
                  ) : (
                    <button
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9]"
                    >
                      실행
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">매출 트렌드</h3>
          </div>
          <div className="mt-4 flex h-44 items-end gap-2 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-3 pb-3 pt-4">
            {dashboard.kpi_trend.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${(point.revenue / trendMax) * 100}%` }} />
                <span className="text-[10px] text-slate-400">{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            {dashboard.revenue_vs_yesterday >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
            <h3 className="text-lg font-bold text-slate-900">운영 해석</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>현재 매출은 <strong className="text-slate-900">{dashboard.today_revenue.toLocaleString()}원</strong> 입니다.</p>
            <p>전일 대비 변화는 <strong className={dashboard.revenue_vs_yesterday >= 0 ? "text-emerald-600" : "text-red-600"}>{dashboard.revenue_vs_yesterday >= 0 ? "+" : ""}{dashboard.revenue_vs_yesterday.toLocaleString()}원</strong> 입니다.</p>
            <p>결제건수와 객단가를 함께 보면 운영 원인 해석이 더 정확합니다. 현재 객단가는 <strong className="text-slate-900">{dashboard.avg_order_value.toLocaleString()}원</strong> 입니다.</p>
          </div>
        </article>
      </section>

      {insights && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">고객 인사이트</h3>
            <span className="ml-auto text-xs text-slate-400">도도포인트 기준 · 최근 90일</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "고유 고객수", value: `${insights.unique_customers.toLocaleString()}명`, tone: "blue" },
              { label: "재방문율", value: `${(insights.return_rate * 100).toFixed(1)}%`, tone: insights.return_rate >= 0.5 ? "emerald" : "amber" },
              { label: "최근 7일 방문", value: `${insights.recent_7d_visits.toLocaleString()}건`, tone: "blue" },
              {
                label: "방문 추세",
                value: `${insights.visit_trend_delta_pct >= 0 ? "+" : ""}${insights.visit_trend_delta_pct.toFixed(1)}%`,
                tone: insights.visit_trend_delta_pct >= 0 ? "emerald" : "red",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className={cn("mt-1 text-xl font-bold",
                  item.tone === "emerald" ? "text-emerald-600" :
                  item.tone === "red" ? "text-red-500" :
                  item.tone === "amber" ? "text-amber-600" : "text-slate-900"
                )}>{item.value}</p>
              </div>
            ))}
          </div>

          {insights.daily_trend.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-500">일별 방문 추이</p>
              <div className="flex h-20 items-end gap-0.5 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-2 pb-2 pt-3">
                {(() => {
                  const maxV = Math.max(...insights.daily_trend.map((d) => d.visit_count), 1);
                  const step = Math.max(1, Math.floor(insights.daily_trend.length / 30));
                  const visible = insights.daily_trend.filter((_, i) => i % step === 0).slice(-30);
                  return visible.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.visit_count}건`}
                      className="flex-1 rounded-t bg-primary/70 min-w-0"
                      style={{ height: `${(d.visit_count / maxV) * 100}%` }}
                    />
                  ));
                })()}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>{insights.daily_trend[0]?.date}</span>
                <span>{insights.daily_trend[insights.daily_trend.length - 1]?.date}</span>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 border-t border-[#DCE4F3] pt-3">
            <span><RefreshCw className="inline h-3 w-3 mr-1" />적립 {insights.earn_count.toLocaleString()}건</span>
            <span>사용 {insights.use_count.toLocaleString()}건</span>
            <span className="ml-auto">기준일 {insights.latest_date ?? "-"}</span>
          </div>
        </section>
      )}
    </div>
  );
};
