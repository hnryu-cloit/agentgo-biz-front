import type React from "react";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart2, Info } from "lucide-react";
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
  { label: "순이익", before: 157000, during: 198000, after: 180000, unit: "원", higherIsBetter: true },
  { label: "일평균 객수", before: 124, during: 178, after: 152, unit: "명", higherIsBetter: true },
  { label: "객단가", before: 7016, during: 6966, after: 6908, unit: "원", higherIsBetter: true },
  { label: "마진율", before: 18.1, during: 15.9, after: 17.1, unit: "%", higherIsBetter: true },
  { label: "취소율", before: 4.2, during: 3.1, after: 3.8, unit: "%", higherIsBetter: false },
];

const contributions = [
  { label: "객수 증가", value: 43, positive: true },
  { label: "시간대 효과 (저녁)", value: 28, positive: true },
  { label: "채널 효과 (앱푸시)", value: 19, positive: true },
  { label: "객단가 하락", value: -15, positive: false },
  { label: "마진 희생", value: -22, positive: false },
];

const periodLabels: Record<PeriodKey, string> = {
  before: "프로모션 전",
  during: "프로모션 기간",
  after: "프로모션 후",
};

export const PromoRoiPage: React.FC = () => {
  const [compareBase, setCompareBase] = useState<PeriodKey>("before");

  const getValue = (row: MetricRow, period: PeriodKey) => row[period];

  const getDelta = (row: MetricRow, period: PeriodKey) => {
    const base = row[compareBase];
    const target = row[period];
    return ((target - base) / base) * 100;
  };

  const isGood = (row: MetricRow, delta: number) => {
    return row.higherIsBetter ? delta >= 0 : delta <= 0;
  };

  const totalRoi = (() => {
    const beforeProfit = metrics[1].before * 7;
    const duringProfit = metrics[1].during * 7;
    const cost = 350000; // mock 프로모션 비용
    return (((duringProfit - beforeProfit) / cost) * 100).toFixed(0);
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">성과 분석</p>
            <h2 className="text-2xl font-bold text-slate-900">프로모션 ROI 분석</h2>
            <p className="mt-1 text-base text-slate-500">
              프로모션 전·후·기간의 핵심 지표를 비교하고 기여요인을 분해합니다.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-1 shadow-sm">
            {(["before", "during", "after"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                onClick={() => setCompareBase(p)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  compareBase === p
                    ? "bg-white text-[#2454C8] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {periodLabels[p]} <span className="text-[9px] opacity-60">기준</span>
              </button>
            ))}
          </div>
        </div>

        {/* Period Info Cards */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {(["before", "during", "after"] as PeriodKey[]).map((p) => {
            const dateMap: Record<PeriodKey, string> = {
              before: "2026-02-16 ~ 2026-02-28",
              during: "2026-03-01 ~ 2026-03-07",
              after: "2026-03-08 ~ 2026-03-09",
            };
            const isDuring = p === "during";
            return (
              <div key={p} className={cn(
                "rounded-xl border p-3.5 shadow-sm transition-all",
                isDuring ? "border-[#CFE0FF] bg-[#EEF4FF]" : "border-[#DCE4F3] bg-white"
              )}>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.1em]",
                  isDuring ? "text-[#2454C8]" : "text-slate-400"
                )}>
                  {periodLabels[p]}
                </p>
                <p className={cn(
                  "mt-1 text-xs font-bold font-mono",
                  isDuring ? "text-[#2454C8]" : "text-slate-600"
                )}>{dateMap[p]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ROI Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Promotion ROI</p>
            <div className="rounded-lg bg-white p-1 shadow-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#2454C8] leading-none">{totalRoi}<span className="text-lg ml-1">%</span></p>
          <p className="mt-2 text-xs font-medium text-slate-400 leading-snug">프로모션 비용 대비 발생한<br />순이익의 실질 증가분입니다.</p>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">매출 증가율</p>
          <p className="text-4xl font-black text-emerald-600 leading-none">
            +{Math.round(((metrics[0].during - metrics[0].before) / metrics[0].before) * 100)}<span className="text-lg ml-1">%</span>
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">캠페인 집행 기간 평균 기준</p>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">유의성 지표</p>
              <Info className="h-3 w-3 text-slate-300" />
            </div>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 shadow-sm border border-emerald-100">STABLE</span>
          </div>
          <p className="text-4xl font-black text-slate-900 leading-none">p <span className="text-2xl font-bold">&lt; 0.05</span></p>
          <p className="mt-2 text-xs font-bold text-emerald-600">결과가 통계적으로 매우 유의함</p>
        </article>
      </section>

      {/* Metric Comparison Table */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-center gap-2 mb-5">
          <div className="rounded-lg bg-slate-100 p-1.5 shadow-sm">
            <BarChart2 className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">지표 전후 비교 상세</h3>
            <p className="text-xs font-medium text-slate-400">순이익 우선 기준으로 정렬된 주요 지표 변화입니다.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">지표</th>
                {(["before", "during", "after"] as PeriodKey[]).map((p) => (
                  <th key={p} className={cn(
                    "px-4 py-3 text-right font-bold transition-colors",
                    p === compareBase ? "bg-primary/5 text-primary" : ""
                  )}>
                    {periodLabels[p]}
                    {p === compareBase && <span className="ml-1 text-[9px] font-black tracking-tighter opacity-60">(기준)</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-slate-900">기간 중 증감</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => {
                const delta = getDelta(row, "during");
                const good = isGood(row, delta);
                return (
                  <tr key={row.label} className="border-t border-border transition-colors hover:bg-slate-50/50 font-medium">
                    <td className="px-4 py-3 font-bold text-slate-800">{row.label}</td>
                    {(["before", "during", "after"] as PeriodKey[]).map((p) => (
                      <td key={p} className={cn(
                        "px-4 py-3 text-right text-slate-600 font-mono text-[13px]",
                        p === compareBase ? "bg-primary/[0.02]" : ""
                      )}>
                        {typeof getValue(row, p) === "number" && row.unit === "원"
                          ? getValue(row, p).toLocaleString()
                          : getValue(row, p)}
                        <span className="text-[10px] ml-0.5 text-slate-400 font-medium">{row.unit !== "원" ? row.unit : "원"}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black shadow-sm",
                        good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {good ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contribution Decomposition */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">효과 기여요인 분해</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">ROI 증감에 영향을 준 하위 요인별 분석</p>
          </div>
          <span className="rounded-lg border border-[#DCE4F3] bg-[#F7FAFF] px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">AI Decomposition Model v2.1</span>
        </div>

        <div className="space-y-5">
          {contributions.map((c) => {
            const abs = Math.abs(c.value);
            return (
              <div key={c.label} className="flex items-center gap-4">
                <span className="w-32 shrink-0 text-sm font-bold text-slate-600 leading-tight">{c.label}</span>
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className={cn(
                          "absolute h-full rounded-full shadow-sm transition-all duration-1000",
                          c.positive ? "bg-emerald-400" : "bg-red-400"
                        )}
                        style={{ width: `${abs}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn(
                    "w-14 shrink-0 text-right text-sm font-black font-mono",
                    c.positive ? "text-emerald-600" : "text-red-600"
                  )}>
                    {c.value > 0 ? "+" : ""}{c.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-[#CFE0FF] bg-[#F7FAFF] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="h-4 w-4 text-[#2454C8]" />
            <p className="text-sm font-bold text-[#2454C8]">AI 해석 가이드</p>
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            객수 증가와 시간대 효과가 주요 기여 요인입니다. 객단가 하락과 마진 희생이 부분 상쇄되었으나 <span className="font-bold text-slate-900 underline decoration-[#CFE0FF] decoration-2">전체 ROI는 매우 긍정적</span>으로 분석됩니다.
          </p>
        </div>
      </section>
    </div>
  );
};