import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, Megaphone, RefreshCw, Sparkles, TrendingDown, TrendingUp, Users, Zap, ShoppingBag, AlertTriangle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistActionBar } from "@/components/commons/AssistActionBar";
import { InlineAssistPanel } from "@/components/commons/InlineAssistPanel";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
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
    id: "1",
    level: "P0" as const,
    title: "객수 회복 프로모션 점검",
    why: "전일 대비 매출과 객수 흐름을 함께 확인해야 합니다.",
    impact: "비피크 시간대 매출 회복",
  },
  {
    id: "2",
    level: "P1" as const,
    title: "객단가 상향 메뉴 제안",
    why: "평균 객단가와 결제건수 조합을 기준으로 업셀링 포인트를 확인합니다.",
    impact: "객단가 개선",
  },
];

function openAiAssist(label: string, prompt: string, contextText?: string, intent: "summary" | "action" = "summary") {
  window.dispatchEvent(new CustomEvent("agentgo-ai-assist", {
    detail: { label, prompt, contextText, intent },
  }));
}

export const OwnerDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<OwnerDashboard>(emptyDashboard);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [actions, setActions] = useState<ActionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [selectedAssistCard, setSelectedAssistCard] = useState<string | null>(null);
  const [inlineAssist, setInlineAssist] = useState<{ cardId: string; title: string; why: string; actionLabel: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    getOwnerDashboard()
      .then((response) => {
        if (!alive) return;
        setDashboard(response);
        const key = response.store_key ?? undefined;
        return Promise.all([getOwnerActions(), getCustomerInsights(key, 90)]);
      })
      .then((result) => {
        if (!alive || !result) return;
        const [actionResponse, ins] = result;
        if (actionResponse) setActions(actionResponse);
        if (ins && ins.daily_trend.length > 0) setInsights(ins);
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "점주 대시보드를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const trendMax = Math.max(...dashboard.kpi_trend.map((item) => item.revenue), 1);

  // AI 분석 기반 액션 생성
  const aiActions = useMemo(() => {
    const list: any[] = [];
    if (dashboard.ai_analysis?.menu_strategy) {
      dashboard.ai_analysis.menu_strategy.ai_insights.forEach((insight: { type: string; title: string; description: string }, idx: number) => {
        list.push({
          id: `ai-menu-${idx}`,
          level: insight.type === "danger" || insight.type === "warning" ? "P0" : "P1",
          title: insight.title,
          why: insight.description,
          impact: "수익성 개선 및 매출 증대",
          status: "pending",
        });
      });
    }
    if (dashboard.ai_analysis?.customer_intelligence) {
      dashboard.ai_analysis.customer_intelligence.ai_insights.forEach((insight: { type: string; title: string; description: string }, idx: number) => {
        list.push({
          id: `ai-churn-${idx}`,
          level: insight.type === "danger" ? "P0" : "P1",
          title: insight.title,
          why: insight.description,
          impact: "고객 리텐션 및 재방문 활성화",
          status: "pending",
        });
      });
    }
    return list;
  }, [dashboard.ai_analysis]);

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
        : aiActions.length > 0 ? aiActions : actionTemplates.map((action) => ({
            ...action,
            status: "pending" as ActionStatus,
          }))
    ),
    [actions, aiActions],
  );

  const completedCount = actionBoard.filter((action) => action.status === "executed").length;

  if (isLoading) {
    return <LoadingState message="점주 대시보드를 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="점주 대시보드를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

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

  const handleAssist = (
    cardId: string,
    label: string,
    prompt: string,
    contextText?: string,
    intent: "summary" | "action" = "summary",
  ) => {
    setSelectedAssistCard(cardId);
    setInlineAssist({
      cardId,
      title: label,
      why: contextText
        ? `${contextText}가 오늘 운영 흐름에서 무엇을 의미하는지 먼저 보는 것이 중요합니다.`
        : "이 카드가 오늘 운영 흐름에서 무엇을 뜻하는지 먼저 확인해야 합니다.",
      actionLabel: intent === "action"
        ? "오늘 바로 할 일 1개만 정해 점검하세요."
        : "해설을 본 뒤 추천 조치로 바로 이어가세요.",
    });
    openAiAssist(label, prompt, contextText, intent);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 페이지 헤더 */}
      {dashboard.ai_analysis?.ai_reasoning ? (
        <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">점주 홈</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{dashboard.store_name} 운영 브리핑</h2>
                <p className="mt-1 text-sm text-slate-500">
                  오늘 매장 운영 상태와 우선 실행 항목을 확인합니다.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[#DCE4F3] bg-white px-3 py-2">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">생성 시각</span>
              <span className="text-sm font-semibold text-slate-700">
                {dashboard.ai_analysis?.generated_at ? new Date(dashboard.ai_analysis.generated_at).toLocaleString() : (dashboard.latest_date ?? "실시간")}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI Morning Briefing</p>
                <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                {dashboard.ai_analysis.ai_reasoning.headline}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {dashboard.ai_analysis.ai_reasoning.reasoning}
                </p>
                <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-emerald-600">오늘의 우선 조치</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {dashboard.ai_analysis.ai_reasoning.action_item}
                  </p>
                </div>
                <AssistActionBar
                  className="mt-4 max-w-md"
                  summary={{
                    label: "해설 보기",
                    onClick: () => openAiAssist("전략 해설", "현재 점주 전략 브리핑을 해설해줘", dashboard.ai_analysis?.ai_reasoning?.reasoning),
                  }}
                  action={{
                    label: "추천 조치",
                    onClick: () => openAiAssist("추천 조치", "현재 브리핑 기준으로 점주가 지금 바로 할 일을 알려줘", dashboard.ai_analysis?.ai_reasoning?.action_item, "action"),
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">점주 홈</p>
                <h2 className="mt-0.5 text-2xl font-bold text-slate-900">{dashboard.store_name} 운영 브리핑</h2>
                <p className="mt-1 text-sm text-slate-500">오늘 운영 상태와 핵심 지표를 확인합니다.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 block">생성 시각</span>
              <span className="text-sm font-semibold text-slate-500">{dashboard.ai_analysis?.generated_at ? new Date(dashboard.ai_analysis.generated_at).toLocaleString() : (dashboard.latest_date ?? "실시간")}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <p className="text-sm font-medium text-slate-500">실적 요약</p>
              <div className="flex items-end justify-between">
                <p className="mt-3 text-3xl font-bold text-slate-900">{dashboard.today_revenue.toLocaleString()}<span className="ml-1 text-xs font-bold">원</span></p>
                <p className={cn("text-xs font-semibold flex items-center gap-0.5", dashboard.revenue_vs_yesterday >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {dashboard.revenue_vs_yesterday >= 0 ? "+" : ""}{dashboard.revenue_vs_yesterday.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <p className="text-sm font-medium text-slate-500">운영 지수</p>
              <div className="flex items-end justify-between">
                <p className="mt-3 text-3xl font-bold text-slate-900">{dashboard.transaction_count.toLocaleString()}<span className="ml-1 text-xs font-bold">건</span></p>
                <p className="text-xs font-semibold text-primary">AOV {Math.round(dashboard.avg_order_value / 1000)}k</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-amber-700">주의 필요</p>
              <div className="flex items-end justify-between">
                <p className="mt-3 text-3xl font-bold text-slate-900">{(dashboard.cancel_rate * 100).toFixed(1)}<span className="ml-1 text-xs font-bold">%</span></p>
                <p className="text-xs font-semibold text-amber-600">취소율 모니터링</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. 메뉴 엔지니어링 분석 섹션 */}
      {dashboard.ai_analysis?.menu_strategy && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">수익성 및 메뉴 엔지니어링</h3>
            <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-tighter">AI Analysis</span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "효자 메뉴 (Star)", count: dashboard.ai_analysis.menu_strategy.summary.star_count, color: "text-emerald-600" },
              { label: "식사 메뉴 (Plowhorse)", count: dashboard.ai_analysis.menu_strategy.summary.plowhorse_count, color: "text-blue-600" },
              { label: "수수께끼 (Puzzle)", count: dashboard.ai_analysis.menu_strategy.summary.puzzle_count, color: "text-amber-600" },
              { label: "삭제 대상 (Dog)", count: dashboard.ai_analysis.menu_strategy.summary.dog_count, color: "text-red-600" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 border border-border/50 bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-black", stat.color)}>{stat.count}</span>
                  <span className="text-xs font-bold text-slate-400">개</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border/60 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-border/60">
                <tr>
                  <th className="px-4 py-3">메뉴명</th>
                  <th className="px-4 py-3 text-center">판매량</th>
                  <th className="px-4 py-3 text-right">단위 마진</th>
                  <th className="px-4 py-3 text-center">AI 분류</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dashboard.ai_analysis.menu_strategy.menu_matrix.slice(0, 5).map((menu: { menu_name: string; qty: number; unit_margin: number; category: string }, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700">{menu.menu_name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">{menu.qty}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">₩{Math.round(menu.unit_margin).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase italic",
                        menu.category === "Star" ? "bg-emerald-100 text-emerald-700" :
                        menu.category === "Plowhorse" ? "bg-blue-100 text-blue-700" :
                        menu.category === "Puzzle" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {menu.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. 오늘의 운영 액션 보드 */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">오늘의 지능형 액션</h3>
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            {completedCount}/{actionBoard.length} Tasks
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {actionBoard.length === 0 ? (
            <EmptyState
              title="오늘 실행할 액션이 없습니다"
              description="현재 매장 상태 기준으로 즉시 조치가 필요한 항목이 없거나 아직 액션이 생성되지 않았습니다."
            />
          ) : (
            actionBoard.map((action) => (
              <article
                key={action.id}
                className={cn(
                  "rounded-2xl border p-5 transition-all group hover:border-primary/30 hover:shadow-md",
                  action.status === "executed" ? "border-emerald-100 bg-emerald-50/30 opacity-80" : "border-[#DCE4F3] bg-[#F7FAFF]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        action.level === "P0" ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-700"
                      )}>
                        {action.level}
                      </span>
                      <p className="text-base font-bold text-slate-900">{action.title}</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 mb-4">{action.why}</p>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-white px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-[11px] font-semibold text-primary">예상 효과: {action.impact}</span>
                    </div>
                    <AssistActionBar
                      className="mt-4 max-w-sm"
                      compact
                      summary={{
                        label: "해설 보기",
                        onClick: () => openAiAssist(`${action.title} 해설`, "이 액션을 점주 관점에서 해설해줘", `${action.title}: ${action.why}`),
                      }}
                      action={{
                        label: "추천 조치",
                        onClick: () => openAiAssist(`${action.title} 실행 가이드`, "이 액션을 오늘 어떻게 실행하면 좋을지 순서대로 알려줘", `${action.title}: ${action.impact}`, "action"),
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {action.status !== "executed" ? (
                      <button
                        onClick={() => handleActionStatus(action.id, "executed")}
                        disabled={pendingActionId === action.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9] disabled:opacity-50"
                      >
                        실행
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
                        <Zap className="h-3 w-3 fill-emerald-700" /> 완료
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 4. 기타 지표 요약 */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "매출", value: `${dashboard.today_revenue.toLocaleString()}원`, tone: dashboard.revenue_vs_yesterday >= 0 ? "emerald" : "red", icon: DollarSign },
          { label: "결제건수", value: `${dashboard.transaction_count.toLocaleString()}건`, tone: "blue", icon: Users },
          { label: "평균 객단가", value: `${dashboard.avg_order_value.toLocaleString()}원`, tone: "blue", icon: ShoppingBag },
          { label: "취소율", value: `${(dashboard.cancel_rate * 100).toFixed(2)}%`, tone: dashboard.cancel_rate > 0.03 ? "amber" : "emerald", icon: AlertTriangle },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article
              key={kpi.label}
              className={cn(
                "rounded-2xl border p-5 shadow-elevated transition-all",
                selectedAssistCard === `owner-kpi-${kpi.label}`
                  ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
                  : "border-border/90 bg-card",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{kpi.value}</p>
              <AssistActionBar
                className="mt-4"
                compact
                summary={{
                  label: "해설 보기",
                  onClick: () => handleAssist(`owner-kpi-${kpi.label}`, `${kpi.label} 해설`, `${kpi.label} 수치를 점주 관점에서 해설해줘`, `${kpi.label}: ${kpi.value}`),
                }}
                action={{
                  label: "추천 조치",
                  onClick: () => handleAssist(`owner-kpi-${kpi.label}`, `${kpi.label} 추천 조치`, `${kpi.label} 기준으로 점주가 지금 해야 할 액션을 알려줘`, `${kpi.label}: ${kpi.value}`, "action"),
                }}
                compare={{
                  label: "비교 보기",
                  onClick: () => handleAssist(`owner-kpi-${kpi.label}`, `${kpi.label} 비교 보기`, `${kpi.label}를 다른 운영 지표와 비교해서 볼 포인트를 알려줘`, `${kpi.label}: ${kpi.value}`),
                }}
              />
            </article>
          );
        })}
      </section>

      {inlineAssist && inlineAssist.cardId.startsWith("owner-kpi-") && (
        <InlineAssistPanel
          title={inlineAssist.title}
          why={inlineAssist.why}
          actionLabel={inlineAssist.actionLabel}
        />
      )}

      {/* 5. 매출 트렌드 및 고객 방문 분석 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">시간대별 매출 추이</h3>
            </div>
            {dashboard.ai_analysis?.sales_trend?.peak_hours && (
              <div className="flex gap-1.5">
                {dashboard.ai_analysis.sales_trend.peak_hours.slice(0, 2).map((h: number) => (
                  <span key={h} className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase italic">
                    PEAK {h}H
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex h-48 items-end gap-1 rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 pb-4 pt-8 relative">
            {dashboard.kpi_trend.map((point) => {
              const hourNum = parseInt(point.label);
              const isPeak = dashboard.ai_analysis?.sales_trend?.peak_hours?.includes(hourNum);
              
              return (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2 group relative">
                  <div 
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500 group-hover:shadow-lg",
                      isPeak 
                        ? "bg-gradient-to-t from-amber-400 to-orange-400" 
                        : "bg-gradient-to-t from-primary/40 to-primary/80"
                    )}
                    style={{ height: `${(point.revenue / trendMax) * 100}%` }} 
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                      {Math.round(point.revenue / 1000)}k
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{point.label}</span>
                </div>
              );
            })}
          </div>
          
          {dashboard.ai_analysis?.sales_trend?.summary && (
            <p className="mt-4 text-[11px] font-medium text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              <span className="text-primary font-bold mr-1">AI 해석:</span>
              {dashboard.ai_analysis.sales_trend.summary}
            </p>
          )}
        </article>

        {insights && (
          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
            <div className="mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">고객 방문 분석</h3>
              <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dodo Point CRM</span>
            </div>

            <AssistActionBar
              className="mb-4 max-w-sm"
              compact
              summary={{
                label: "해설 보기",
                onClick: () => openAiAssist("재방문율 해설", "재방문율과 고유 고객 수를 점주 관점에서 해설해줘", `재방문율 ${(insights.return_rate * 100).toFixed(1)}%, 고유 고객 ${insights.unique_customers}명`),
              }}
              action={{
                label: "추천 조치",
                onClick: () => openAiAssist("고객 추천 조치", "고객 방문 분석 기준으로 점주가 할 CRM 액션을 추천해줘", `최근 7일 방문 ${insights.recent_7d_visits}건`, "action"),
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "고유 고객수", value: `${insights.unique_customers.toLocaleString()}명`, icon: Users, color: "text-blue-600" },
                { label: "재방문율", value: `${(insights.return_rate * 100).toFixed(1)}%`, icon: RefreshCw, color: "text-emerald-600" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 group transition-all hover:bg-white hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                    <item.icon className="h-3 w-3 text-slate-300" />
                  </div>
                  <p className={cn("text-2xl font-black", item.color)}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border/50 pt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Recent 30 Days Trend
              </p>
              <div className="flex h-16 items-end gap-0.5 rounded-xl bg-slate-50 px-2 pb-1.5">
                {insights.daily_trend.slice(-30).map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/40 min-w-0 hover:bg-primary transition-colors"
                    style={{ height: `${(d.visit_count / Math.max(...insights.daily_trend.map(x => x.visit_count), 1)) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
};
