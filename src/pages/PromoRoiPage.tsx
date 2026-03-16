import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart2, Calendar, DollarSign, Info, Layers, Target, TrendingUp } from "lucide-react";
import { getRoiAnalysis, type RoiMetrics } from "@/services/analysis";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    let alive = true;
    getRoiAnalysis()
      .then((response) => {
        if (!alive) return;
        setRoi(response);
      })
      .catch(() => {
        if (!alive) return;
        setRoi(emptyMetrics);
      });
    return () => {
      alive = false;
    };
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Financial Impact Analysis</span>
          </div>
          <h1 className="ds-page-title">프로모션 성과 (ROI) <span className="font-light text-muted-foreground">|</span> Real Data</h1>
        </div>
        <div className="ds-glass flex items-center gap-3 rounded-xl px-4 py-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{roi.period_label}</span>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="ds-kpi-card bg-ai-gradient relative overflow-hidden border-none p-8 text-white">
          <div className="absolute right-0 top-0 p-6 opacity-20">
            <TrendingUp className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <p className="ds-eyebrow mb-4 !text-[9px] !text-white/70">Total Promotion ROI</p>
            <div className="flex items-end gap-3">
              <p className="text-6xl font-black italic leading-none">{roi.roi_rate.toFixed(0)}%</p>
              {roi.roi_rate >= 0 ? <ArrowUpRight className="mb-1 h-10 w-10 opacity-80" /> : <ArrowDownRight className="mb-1 h-10 w-10 opacity-80" />}
            </div>
            <p className="mt-8 text-sm font-bold italic leading-relaxed opacity-90">
              집행 비용 ₩{roi.promo_cost.toLocaleString()} 대비
              <br />
              증분 매출 ₩{roi.incremental_revenue.toLocaleString()}
            </p>
          </div>
        </article>

        <article className="ds-kpi-card p-8">
          <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
            <p className="ds-eyebrow !text-[9px]">Incremental Revenue</p>
            <span className="ds-badge ds-badge-success border-none">Data Snapshot</span>
          </div>
          <p className="mb-2 text-4xl font-black italic tracking-tighter text-foreground">
            {roi.incremental_revenue >= 0 ? "+" : ""}₩{Math.abs(roi.incremental_revenue).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-soft">
              <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, Math.abs(roi.roi_rate))}%` }} />
            </div>
            <span className="text-[11px] font-black italic text-emerald-600">{roi.roi_rate.toFixed(1)}%</span>
          </div>
        </article>

        <article className="ds-kpi-card p-8">
          <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
            <p className="ds-eyebrow !text-[9px]">Current Revenue</p>
            <Info className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <p className="mb-2 text-4xl font-black italic tracking-tighter text-foreground">₩{roi.revenue_during.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="live-point" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 italic">Latest Window</span>
          </div>
        </article>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <section className="ds-card overflow-hidden lg:col-span-8">
          <div className="ds-card-header !bg-panel-soft/30">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="ds-section-title">실데이터 비교 지표</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead className="ds-table-thead">
                <tr>
                  <th className="ds-table-th">Metric</th>
                  <th className="ds-table-th text-right">Current</th>
                  <th className="ds-table-th text-right">Baseline</th>
                  <th className="ds-table-th w-36 text-right italic">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics.map((row) => {
                  const delta = row.baseline === 0 ? 0 : ((row.current - row.baseline) / row.baseline) * 100;
                  const good = row.higherIsBetter ? delta >= 0 : delta <= 0;
                  return (
                    <tr key={row.label} className="ds-table-tr font-bold">
                      <td className="ds-table-td italic tracking-tight text-foreground">{row.label}</td>
                      <td className="ds-table-td text-right font-mono font-black italic tracking-tighter text-foreground">
                        {row.current.toLocaleString()}
                        <span className="ml-1 text-[10px] font-black text-muted-foreground/40">{row.unit}</span>
                      </td>
                      <td className="ds-table-td text-right font-mono font-bold italic text-muted-foreground/40">
                        {row.baseline.toLocaleString()}
                        <span className="ml-1 text-[10px]">{row.unit}</span>
                      </td>
                      <td className="ds-table-td text-right">
                        <div className={cn("inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black italic shadow-inner", good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                          {good ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-8 lg:col-span-4">
          <article className="ds-card border-primary/5 p-8">
            <div className="mb-10 flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="ds-section-title flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground italic">
                <Target className="h-4 w-4" /> Impact Decomposition
              </h3>
            </div>

            <div className="space-y-8">
              {roi.contributing_factors.map((factor) => {
                const abs = Math.min(100, Math.abs(factor.weight));
                const positive = factor.weight >= 0;
                return (
                  <div key={factor.factor} className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
                      <span className="text-foreground/60">{factor.factor}</span>
                      <span className={positive ? "text-emerald-600" : "text-red-500"}>{factor.weight > 0 ? "+" : ""}{factor.weight}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-panel-soft">
                      <div className={cn("h-full transition-all duration-1000", positive ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]")} style={{ width: `${abs}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ds-ai-panel relative mt-12 border-none p-6 shadow-none">
              <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] italic text-white">AI Strategic Verdict</div>
              <p className="mt-2 text-sm font-black italic leading-relaxed text-foreground">
                최근 집계 기간 기준 증분 매출은 <span className="text-primary underline decoration-4 decoration-primary/30 underline-offset-4">₩{roi.incremental_revenue.toLocaleString()}</span> 입니다. 비용 대비 효율과 취소율 변화를 함께 확인하면서 다음 기간 프로모션 강도를 조정하는 편이 맞습니다.
              </p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
