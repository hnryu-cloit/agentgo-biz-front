import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, Megaphone, RefreshCw, Sparkles, TrendingDown, TrendingUp, Users, Zap, ShoppingBag, AlertTriangle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCustomerInsights, getOwnerActions, getOwnerDashboard, updateActionStatus, type CustomerInsights, type OwnerDashboard } from "@/services/owner";
import type { ActionResponse, ActionStatus } from "@/types/api";
import { ownerCustomerInsightsMock, ownerDashboardMock } from "@/lib/mockData";

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

export const OwnerDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<OwnerDashboard>(emptyDashboard);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [actions, setActions] = useState<ActionResponse[]>([]);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
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
        if (ins) setInsights(ins.daily_trend.length > 0 ? ins : ownerCustomerInsightsMock);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(ownerDashboardMock);
        setInsights(ownerCustomerInsightsMock);
      });
    return () => {
      alive = false;
    };
  }, []);

  const trendMax = Math.max(...dashboard.kpi_trend.map((item) => item.revenue), 1);

  // AI 분석 기반 액션 생성
  const aiActions = useMemo(() => {
    const list: any[] = [];
    if (dashboard.ai_analysis?.menu_engineering) {
      dashboard.ai_analysis.menu_engineering.ai_insights.forEach((insight, idx) => {
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
    if (dashboard.ai_analysis?.customer_churn) {
      dashboard.ai_analysis.customer_churn.ai_insights.forEach((insight, idx) => {
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
      {/* 1. AI 실시간 전략 제언 (Gemini Interpretation) */}
      {dashboard.ai_analysis?.ai_reasoning ? (
        <section className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-[#EEF4FF] via-white to-[#F7FAFF] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg ring-4 ring-white">
              <Sparkles className="h-7 w-7 text-white fill-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Strategy Expert</span>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {dashboard.ai_analysis.ai_reasoning.headline}
              </h2>
              <p className="mt-3 text-base font-medium text-slate-600 leading-relaxed">
                {dashboard.ai_analysis.ai_reasoning.reasoning}
              </p>
              
              <div className="mt-5 flex items-center gap-4 p-4 rounded-2xl bg-white border border-primary/10 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Zap className="h-4 w-4 fill-emerald-600" />
                </div>
                <p className="text-sm font-black text-slate-800">
                  <span className="text-emerald-600 mr-2">Today's Action:</span>
                  {dashboard.ai_analysis.ai_reasoning.action_item}
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-48 p-4 rounded-2xl bg-slate-900 text-white shadow-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Quick Metrics</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">매출 흐름</span>
                  <span className={cn("text-xs font-black", dashboard.revenue_vs_yesterday >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {dashboard.revenue_vs_yesterday >= 0 ? "▲" : "▼"} {Math.abs(dashboard.revenue_vs_yesterday).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">취소 리스크</span>
                  <span className="text-xs font-black text-amber-400">{(dashboard.cancel_rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg ring-4 ring-white">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> AI Morning Briefing
                </p>
                <h3 className="mt-0.5 text-lg font-black text-slate-900">{dashboard.store_name} 지능형 리포트</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Generated At</span>
              <span className="text-xs font-bold text-slate-500">{dashboard.ai_analysis?.generated_at ? new Date(dashboard.ai_analysis.generated_at).toLocaleString() : (dashboard.latest_date ?? "실시간")}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 relative z-10">
            <div className="rounded-2xl border border-[#DCE4F3] bg-white/80 backdrop-blur-sm p-4 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">실적 요약</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black text-slate-900">{dashboard.today_revenue.toLocaleString()}<span className="text-xs font-bold ml-1">원</span></p>
                <p className={cn("text-xs font-bold flex items-center gap-0.5", dashboard.revenue_vs_yesterday >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {dashboard.revenue_vs_yesterday >= 0 ? "+" : ""}{dashboard.revenue_vs_yesterday.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#DCE4F3] bg-white/80 backdrop-blur-sm p-4 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">운영 지수</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black text-slate-900">{dashboard.transaction_count.toLocaleString()}<span className="text-xs font-bold ml-1">건</span></p>
                <p className="text-xs font-bold text-primary italic">AOV {Math.round(dashboard.avg_order_value / 1000)}k</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm p-4 shadow-sm">
              <p className="text-[11px] font-bold text-amber-700 uppercase mb-2">주의 필요</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black text-slate-900">{(dashboard.cancel_rate * 100).toFixed(1)}<span className="text-xs font-bold ml-1">%</span></p>
                <p className="text-xs font-bold text-amber-600">취소율 모니터링</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. 메뉴 엔지니어링 분석 섹션 */}
      {dashboard.ai_analysis?.menu_engineering && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">수익성 및 메뉴 엔지니어링</h3>
            <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-tighter">AI Analysis</span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "효자 메뉴 (Star)", count: dashboard.ai_analysis.menu_engineering.summary.star_count, color: "text-emerald-600" },
              { label: "식사 메뉴 (Plowhorse)", count: dashboard.ai_analysis.menu_engineering.summary.plowhorse_count, color: "text-blue-600" },
              { label: "수수께끼 (Puzzle)", count: dashboard.ai_analysis.menu_engineering.summary.puzzle_count, color: "text-amber-600" },
              { label: "삭제 대상 (Dog)", count: dashboard.ai_analysis.menu_engineering.summary.dog_count, color: "text-red-600" },
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
                {dashboard.ai_analysis.menu_engineering.menu_matrix.slice(0, 5).map((menu, i) => (
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
          {actionBoard.map((action) => (
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
                      "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
                      action.level === "P0" ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-amber-500 to-yellow-500"
                    )}>
                      {action.level}
                    </span>
                    <p className="text-base font-black text-slate-900">{action.title}</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-600 mb-4">{action.why}</p>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 border border-border/50 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-tight">Expected Impact: {action.impact}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {action.status !== "executed" ? (
                    <button
                      onClick={() => handleActionStatus(action.id, "executed")}
                      disabled={pendingActionId === action.id}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1E5BE9] active:scale-95 disabled:opacity-50"
                    >
                      실행
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 rounded-xl text-emerald-700 font-black text-xs italic uppercase">
                      <Zap className="h-3 w-3 fill-emerald-700" /> Done
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
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
            <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{kpi.value}</p>
            </article>
          );
        })}
      </section>

      {/* 5. 매출 트렌드 및 고객 방문 분석 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">시간대별 매출 추이</h3>
          </div>
          <div className="flex h-48 items-end gap-1.5 rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 pb-4 pt-6">
            {dashboard.kpi_trend.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2 group">
                <div 
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/60 to-primary transition-all duration-500 group-hover:from-primary hover:shadow-lg" 
                  style={{ height: `${(point.revenue / trendMax) * 100}%` }} 
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        {insights && (
          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">고객 방문 분석</h3>
              <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dodo Point CRM</span>
            </div>

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
