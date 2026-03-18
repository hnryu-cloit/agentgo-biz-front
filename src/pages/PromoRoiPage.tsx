import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart2, Calendar, DollarSign, Sparkles, Target, TrendingUp } from "lucide-react";
import { getRoiAnalysis, getStoreIntelligence, type RoiMetrics, type StoreIntelligence } from "@/services/analysis";
import { cn } from "@/lib/utils";
import { isRoiMetricsEmpty, roiMock } from "@/lib/mockData";

type MetricRow = {
  label: string;
  baseline: number;
  current: number;
  unit: string;
  higherIsBetter: boolean;
};

const emptyMetrics: RoiMetrics = {
  period_label: "데이터 없음",
  promo_cost: 0,
  revenue_before: 0,
  revenue_during: 0,
  revenue_after: 0,
  incremental_revenue: 0,
  roi_rate: 0,
  contributing_factors: [],
};

export const PromoRoiPage: React.FC = () => {
  const [roi, setRoi] = useState<RoiMetrics>(emptyMetrics);
  const [storeIntelligence, setStoreIntelligence] = useState<StoreIntelligence | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getRoiAnalysis().catch(() => null),
      getStoreIntelligence("[CJ]광화문점").catch(() => null),
    ]).then(([response, intelligence]) => {
      if (!alive) return;
      setRoi(!response || isRoiMetricsEmpty(response) ? roiMock : response);
      setStoreIntelligence(intelligence);
    }).catch(() => {
      if (!alive) return;
      setRoi(roiMock);
      setStoreIntelligence(null);
    });
    return () => { alive = false; };
  }, []);

  const metrics = useMemo<MetricRow[]>(() => {
    const baselineVisitors = roi.revenue_before > 0 ? Math.max(1, Math.round(roi.revenue_before / 12000)) : 0;
    const currentVisitors = roi.revenue_during > 0 ? Math.max(1, Math.round(roi.revenue_during / 12000)) : 0;
    const baselineAov = baselineVisitors > 0 ? roi.revenue_before / baselineVisitors : 0;
    const currentAov = currentVisitors > 0 ? roi.revenue_during / currentVisitors : 0;
    return [
      { label: "기간 매출", baseline: roi.revenue_before, current: roi.revenue_during, unit: "원", higherIsBetter: true },
      { label: "추정 객수", baseline: baselineVisitors, current: currentVisitors, unit: "명", higherIsBetter: true },
      { label: "추정 객단가", baseline: baselineAov, current: currentAov, unit: "원", higherIsBetter: true },
      { label: "프로모션 비용", baseline: 0, current: roi.promo_cost, unit: "원", higherIsBetter: false },
    ];
  }, [roi]);
  const peakHours = storeIntelligence
    ? storeIntelligence.staffing
      .map((item) => item.evidence[0]?.period?.split(" ")[1])
      .filter((value): value is string => Boolean(value))
      .join(", ")
    : "";

  return (
    <div className="space-y-6 pb-10">

      {/* 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Financial Impact Analysis</p>
              <h1 className="text-xl font-bold text-foreground">프로모션 성과 (ROI)</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-2.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{roi.period_label}</span>
          </div>
        </div>
      </section>

      {storeIntelligence && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">ROI 연계 AI 실데이터 인사이트</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{storeIntelligence.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { label: "객단가", value: `${storeIntelligence.metrics.sales.avg_order_value.toLocaleString()}원` },
              { label: "최근 7일 방문", value: `${storeIntelligence.metrics.churn.recent_7d_visits.toLocaleString()}건` },
              { label: "재방문율", value: `${(storeIntelligence.metrics.churn.return_rate * 100).toFixed(1)}%` },
              { label: "피크 시간대", value: peakHours || "-" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {storeIntelligence.priority_actions.slice(0, 3).map((item) => (
              <div key={item} className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KPI 카드 3개 */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* ROI 카드 */}
        <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">총 프로모션 ROI</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-3xl font-bold text-foreground">{roi.roi_rate.toFixed(0)}%</p>
                {roi.roi_rate >= 0
                  ? <ArrowUpRight className="mb-0.5 h-5 w-5 text-emerald-500" />
                  : <ArrowDownRight className="mb-0.5 h-5 w-5 text-red-500" />}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                집행 비용 ₩{roi.promo_cost.toLocaleString()} 대비<br />
                증분 매출 ₩{roi.incremental_revenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-[#eef3ff] p-2.5">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </article>

        {/* 증분 매출 카드 */}
        <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">증분 매출</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {roi.incremental_revenue >= 0 ? "+" : ""}₩{Math.abs(roi.incremental_revenue).toLocaleString()}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8edf5]">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.abs(roi.roi_rate))}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600">{roi.roi_rate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <BarChart2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </article>

        {/* 현재 매출 카드 */}
        <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">현재 기간 매출</p>
              <p className="mt-2 text-3xl font-bold text-foreground">₩{roi.revenue_during.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="live-point" />
                <span className="text-xs font-semibold text-emerald-600">최신 집계 기간</span>
              </div>
            </div>
            <div className="rounded-xl bg-[#eef3ff] p-2.5">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </article>
      </section>

      {/* 비교 지표 테이블 + 기여 요인 */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden lg:col-span-8">
          <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
            <div className="rounded-lg bg-[#eef3ff] p-2">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground">실데이터 비교 지표</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-border bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">항목</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">현재</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">기준</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">변화율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics.map((row) => {
                  const delta = row.baseline === 0 ? 0 : ((row.current - row.baseline) / row.baseline) * 100;
                  const good = row.higherIsBetter ? delta >= 0 : delta <= 0;
                  return (
                    <tr key={row.label} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground">{row.label}</td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground tabular-nums">
                        {row.current.toLocaleString()}
                        <span className="ml-1 text-[10px] text-muted-foreground">{row.unit}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground tabular-nums">
                        {row.baseline.toLocaleString()}
                        <span className="ml-1 text-[10px]">{row.unit}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold",
                          good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                          {good ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 lg:col-span-4">
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="rounded-lg bg-[#eef3ff] p-2">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">기여 요인 분해</h2>
            </div>
            <div className="space-y-5">
              {roi.contributing_factors.map((factor) => {
                const abs = Math.min(100, Math.abs(factor.weight));
                const positive = factor.weight >= 0;
                return (
                  <div key={factor.factor} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{factor.factor}</span>
                      <span className={cn("font-semibold", positive ? "text-emerald-600" : "text-red-500")}>
                        {factor.weight > 0 ? "+" : ""}{factor.weight}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
                      <div
                        className={cn("h-full transition-all duration-700", positive ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${abs}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI 인사이트 */}
            <div className="mt-6 rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">AI 전략 제언</p>
              <p className="text-xs font-medium leading-relaxed text-foreground">
                최근 집계 기간 증분 매출은{" "}
                <span className="font-bold text-primary">₩{roi.incremental_revenue.toLocaleString()}</span>입니다.
                비용 대비 효율과 취소율 변화를 함께 확인하면서 다음 기간 프로모션 강도를 조정하는 편이 맞습니다.
              </p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
