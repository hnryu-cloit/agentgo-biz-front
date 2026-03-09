import type React from "react";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart2, Info } from "lucide-react";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">프로모션 ROI 분석</h2>
        <p className="mt-1 text-sm text-slate-500">
          프로모션 전·후·기간의 핵심 지표를 비교하고 기여요인을 분해합니다.
        </p>

        {/* Period Info */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["before", "during", "after"] as PeriodKey[]).map((p) => {
            const dateMap: Record<PeriodKey, string> = {
              before: "2026-02-16 ~ 2026-02-28",
              during: "2026-03-01 ~ 2026-03-07",
              after: "2026-03-08 ~ 2026-03-09",
            };
            return (
              <div key={p} className={`rounded-xl border p-3 ${p === "during" ? "border-[#BFD4FF] bg-[#EEF4FF]" : "border-[#DCE4F3] bg-[#F7FAFF]"}`}>
                <p className={`text-xs font-semibold ${p === "during" ? "text-primary" : "text-slate-500"}`}>
                  {periodLabels[p]}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{dateMap[p]}</p>
              </div>
            );
          })}
        </div>

        {/* Compare Base Selector */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-slate-500">비교 기준:</span>
          {(["before", "during", "after"] as PeriodKey[]).map((p) => (
            <button
              key={p}
              onClick={() => setCompareBase(p)}
              className={
                compareBase === p
                  ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-primary"
                  : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-1 text-xs text-slate-600"
              }
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </section>

      {/* ROI Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5">
          <p className="text-sm font-medium text-slate-500">프로모션 ROI</p>
          <p className="mt-2 text-3xl font-bold text-primary">{totalRoi}%</p>
          <p className="mt-1 text-xs text-slate-500">프로모션 비용 대비 순이익 증가</p>
        </article>
        <article className="rounded-2xl border border-border/90 bg-card p-5">
          <p className="text-sm font-medium text-slate-500">기간 중 매출 증가</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            +{Math.round(((metrics[0].during - metrics[0].before) / metrics[0].before) * 100)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">전 기간 대비</p>
        </article>
        <article className="rounded-2xl border border-border/90 bg-card p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-500">유의성 지표</p>
            <button title="표본 크기와 분산 기준 통계적 유의성">
              <Info className="h-3.5 w-3.5 text-slate-300" />
            </button>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">p &lt; 0.05</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">통계적으로 유의</p>
        </article>
      </section>

      {/* Metric Comparison Table */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">지표 전후 비교</h3>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">순이익 우선 기준으로 주요 지표를 표시합니다.</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3">지표</th>
                {(["before", "during", "after"] as PeriodKey[]).map((p) => (
                  <th key={p} className={`px-4 py-3 text-right ${p === compareBase ? "text-primary" : ""}`}>
                    {periodLabels[p]}
                    {p === compareBase && <span className="ml-1 text-[10px]">(기준)</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">기간 중 증감</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => {
                const delta = getDelta(row, "during");
                const good = isGood(row, delta);
                return (
                  <tr key={row.label} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.label}</td>
                    {(["before", "during", "after"] as PeriodKey[]).map((p) => (
                      <td key={p} className="px-4 py-3 text-right text-slate-700">
                        {typeof getValue(row, p) === "number" && row.unit === "원"
                          ? getValue(row, p).toLocaleString()
                          : getValue(row, p)}
                        {row.unit !== "원" ? row.unit : "원"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <span className={`flex items-center justify-end gap-1 font-semibold ${good ? "text-emerald-600" : "text-red-600"}`}>
                        {good ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h3 className="text-lg font-bold text-slate-900">효과 기여요인 분해</h3>
        <p className="mt-0.5 text-sm text-slate-500">가격·객수·시간대·채널별 기여도 분석</p>

        <div className="mt-5 space-y-3">
          {contributions.map((c) => {
            const abs = Math.abs(c.value);
            return (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-slate-600">{c.label}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                      <div
                        className={`absolute h-full rounded-full ${c.positive ? "bg-emerald-400" : "bg-red-400"}`}
                        style={{ width: `${abs}%` }}
                      />
                    </div>
                  </div>
                  <span className={`w-12 shrink-0 text-right text-sm font-semibold ${c.positive ? "text-emerald-600" : "text-red-600"}`}>
                    {c.value > 0 ? "+" : ""}{c.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
          <p className="text-xs font-semibold text-slate-700">해석 가이드</p>
          <p className="mt-0.5 text-xs text-slate-500">
            객수 증가와 시간대 효과가 주요 기여 요인입니다. 객단가 하락과 마진 희생이 부분 상쇄되었으나 전체 ROI는 긍정적입니다.
          </p>
        </div>
      </section>
    </div>
  );
};