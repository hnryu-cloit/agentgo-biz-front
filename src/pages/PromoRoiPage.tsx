import type React from "react";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart2, Info, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Layers, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type PeriodKey = "before" | "during" | "after";

type MetricRow = {
  label: string;
  before: number;
  during: number;
  after: number;
  unit: string;
  higherIsBetter: boolean;
};

const metrics: MetricRow[] = [
  { label: "일평균 매출", before: 870000, during: 1240000, after: 1050000, unit: "원", higherIsBetter: true },
  { label: "순이익 (Net Profit)", before: 157000, during: 198000, after: 180000, unit: "원", higherIsBetter: true },
  { label: "일평균 객수", before: 124, during: 178, after: 152, unit: "명", higherIsBetter: true },
  { label: "객단가", before: 7016, during: 6966, after: 6908, unit: "원", higherIsBetter: true },
  { label: "마진율", before: 18.1, during: 15.9, after: 17.1, unit: "%", higherIsBetter: true },
  { label: "취소율", before: 4.2, during: 3.1, after: 3.8, unit: "%", higherIsBetter: false },
];

const contributions = [
  { label: "객수 증가 (Quantity)", value: 43, positive: true },
  { label: "시간대 집중 효과", value: 28, positive: true },
  { label: "채널 활성화", value: 19, positive: true },
  { label: "객단가 희생 (Discount)", value: -15, positive: false },
  { label: "마진율 하락", value: -22, positive: false },
];

const periodLabels: Record<PeriodKey, string> = {
  before: "Baseline (전)",
  during: "Campaign (중)",
  after: "Post (후)",
};

export const PromoRoiPage: React.FC = () => {
  const [compareBase, setCompareBase] = useState<PeriodKey>("before");

  const getValue = (row: MetricRow, period: PeriodKey) => row[period];
  const getDelta = (row: MetricRow, period: PeriodKey) => {
    const base = row[compareBase];
    const target = row[period];
    return ((target - base) / base) * 100;
  };
  const isGood = (row: MetricRow, delta: number) => row.higherIsBetter ? delta >= 0 : delta <= 0;

  const totalRoi = (() => {
    const beforeProfit = metrics[1].before * 7;
    const duringProfit = metrics[1].during * 7;
    const cost = 350000;
    return (((duringProfit - beforeProfit) / cost) * 100).toFixed(0);
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Financial Impact Analysis</span>
          </div>
          <h1 className="ds-page-title">프로모션 성과 (ROI) <span className="text-muted-foreground font-light">|</span> Profit Verification</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">Period: 2026-03</span>
          </div>
          <button className="ds-button ds-button-primary h-11 shadow-xl shadow-primary/20">
            <BarChart2 className="h-4 w-4 mr-2" /> Download Full Report
          </button>
        </div>
      </div>

      {/* Primary Summary Grid */}
      <section className="grid gap-5 md:grid-cols-3">
        <article className="ds-kpi-card bg-ai-gradient border-none text-white relative overflow-hidden group p-8">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <p className="ds-eyebrow !text-white/70 !text-[9px] mb-4">Total Promotion ROI</p>
            <div className="flex items-end gap-3">
              <p className="text-6xl font-black italic leading-none">{totalRoi}%</p>
              <ArrowUpRight className="h-10 w-10 mb-1 opacity-80" />
            </div>
            <p className="mt-8 text-sm font-bold opacity-90 leading-relaxed italic">
              집행 비용 ₩350,000 대비<br />₩{((metrics[1].during - metrics[1].before) * 7).toLocaleString()} 수익 순증
            </p>
          </div>
        </article>

        <article className="ds-kpi-card p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <p className="ds-eyebrow !text-[9px]">Incremental Sales</p>
            <span className="ds-badge ds-badge-success border-none">High Gain</span>
          </div>
          <p className="text-4xl font-black text-foreground italic mb-2 tracking-tighter">
            +₩{((metrics[0].during - metrics[0].before) * 7).toLocaleString()}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1.5 bg-panel-soft rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: "42.5%" }} />
            </div>
            <span className="text-[11px] font-black text-emerald-600 uppercase italic">+42.5%</span>
          </div>
        </article>

        <article className="ds-kpi-card p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <p className="ds-eyebrow !text-[9px]">Model Significance</p>
            <Info className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <p className="text-4xl font-black text-foreground italic mb-2 tracking-tighter">p &lt; 0.05</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="live-point" />
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] italic">Validated Index</span>
          </div>
        </article>
      </section>

      {/* Detail Analysis Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Table Column */}
        <section className="lg:col-span-8 ds-card overflow-hidden">
          <div className="ds-card-header !bg-panel-soft/30">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="ds-section-title">지표별 성과 분석 (Deep Dive)</h3>
            </div>
            <div className="flex bg-muted p-1 rounded-xl">
              {(["before", "during", "after"] as PeriodKey[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setCompareBase(p)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                    compareBase === p ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {periodLabels[p].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead className="ds-table-thead">
                <tr>
                  <th className="ds-table-th">Financial Metric</th>
                  <th className="ds-table-th text-right">Campaign (Target)</th>
                  <th className="ds-table-th text-right">Baseline ({compareBase})</th>
                  <th className="ds-table-th text-right w-36 italic">Variance (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics.map((row) => {
                  const delta = getDelta(row, "during");
                  const good = isGood(row, delta);
                  return (
                    <tr key={row.label} className="ds-table-tr font-bold group">
                      <td className="ds-table-td italic text-foreground tracking-tight">{row.label}</td>
                      <td className="ds-table-td text-right font-mono font-black text-foreground italic tracking-tighter">
                        {getValue(row, "during").toLocaleString()}<span className="text-[10px] ml-1 font-black text-muted-foreground/40">{row.unit}</span>
                      </td>
                      <td className="ds-table-td text-right font-mono font-bold text-muted-foreground/40 italic">
                        {getValue(row, compareBase).toLocaleString()}<span className="text-[10px] ml-1">{row.unit}</span>
                      </td>
                      <td className="ds-table-td text-right">
                        <div className={cn(
                          "inline-flex items-center gap-1 font-black text-xs italic transition-all px-3 py-1.5 rounded-xl shadow-inner",
                          good ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                        )}>
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

        {/* Breakdown Sidebar */}
        <section className="lg:col-span-4 space-y-8">
          <article className="ds-card p-8 border-primary/5">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-border/50">
              <h3 className="ds-section-title text-sm uppercase tracking-widest text-muted-foreground italic flex items-center gap-2">
                <Target className="h-4 w-4" /> Impact Decomposition
              </h3>
            </div>
            
            <div className="space-y-8">
              {contributions.map((c) => {
                const abs = Math.abs(c.value);
                return (
                  <div key={c.label} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                      <span className="text-foreground/60">{c.label}</span>
                      <span className={c.positive ? "text-emerald-600" : "text-red-500"}>{c.value > 0 ? "+" : ""}{c.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-panel-soft rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", c.positive ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]")}
                        style={{ width: `${abs}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 ds-ai-panel border-none shadow-none relative">
              <div className="absolute -top-3 left-6 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">AI Strategic Verdict</div>
              <p className="text-sm text-foreground font-black leading-relaxed italic mt-2">
                객수 증가(+43%)가 단가 희생을 완벽히 상쇄하며 <span className="text-primary underline decoration-primary/30 decoration-4 underline-offset-4">역대 최고 수준의 순증</span>을 달성했습니다. 해당 채널 믹스 전략을 표준으로 채택하세요.
              </p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
