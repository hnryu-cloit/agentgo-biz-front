import type React from "react";
import { useMemo, useState } from "react";
import { BarChart2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

type KpiMetric = "sales" | "unitPrice" | "qty" | "margin" | "cancel";

const kpiOptions: { value: KpiMetric; label: string; unit: string }[] = [
  { value: "sales", label: "매출", unit: "천원" },
  { value: "unitPrice", label: "객단가", unit: "원" },
  { value: "qty", label: "객수", unit: "명" },
  { value: "margin", label: "마진율", unit: "%" },
  { value: "cancel", label: "취소율", unit: "%" },
];

const storeNames = storeResources.slice(0, 5).map((s, i) => s?.name ?? `${String.fromCharCode(65 + i)}매장`);

const kpiValues: Record<KpiMetric, number[]> = {
  sales: [870, 1240, 980, 1560, 1820],
  unitPrice: [7016, 8200, 7500, 9100, 10200],
  qty: [124, 151, 131, 172, 178],
  margin: [18.1, 22.4, 20.1, 25.3, 27.8],
  cancel: [4.2, 3.1, 2.8, 1.9, 1.2],
};

// 랭킹 변동 mock (양수=상승, 음수=하락)
const rankDelta: number[] = [-1, 1, 0, 2, -2];

type Period = "이번주" | "이번달" | "전달";

export const SvAnalysisPage: React.FC = () => {
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric>("sales");
  const [period, setPeriod] = useState<Period>("이번주");

  const kpiOpt = kpiOptions.find((o) => o.value === selectedKpi)!;

  const { ranked, kpiMax, topStore, bottomStore, gap, gapPct } = useMemo(() => {
    const sorted = storeNames
      .map((name, i) => ({ name, val: kpiValues[selectedKpi][i], delta: rankDelta[i] }))
      .sort((a, b) => b.val - a.val);
    const max = Math.max(...kpiValues[selectedKpi]);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const g = top.val - bottom.val;
    return { ranked: sorted, kpiMax: max, topStore: top, bottomStore: bottom, gap: g, gapPct: Math.round((g / bottom.val) * 100) };
  }, [selectedKpi]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">SV 분석</h2>
            <p className="mt-1 text-sm text-slate-500">담당 매장 KPI 비교 및 성과 랭킹을 분석합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["이번주", "이번달", "전달"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={
                  period === p
                    ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1.5 text-sm font-semibold text-primary"
                    : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-sm text-slate-600"
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Comparison */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">담당 매장 KPI 비교</h3>
          </div>
          <select
            value={selectedKpi}
            onChange={(e) => setSelectedKpi(e.target.value as KpiMetric)}
            className="h-9 rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700"
          >
            {kpiOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          지표: {kpiOpt.label} ({kpiOpt.unit}) · {period} 기준
        </p>

        <div className="mt-5 space-y-3">
          {ranked.map((row, idx) => (
            <div key={row.name} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                idx === 0 ? "bg-primary text-white" : idx === ranked.length - 1 ? "bg-red-100 text-red-600" : "border border-[#DCE4F3] bg-white text-slate-500"
              }`}>
                {idx + 1}
              </span>
              <span className="w-16 shrink-0 text-sm font-medium text-slate-700">{row.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                  <div
                    className={`h-full rounded-full transition-all ${idx === 0 ? "bg-primary" : idx === ranked.length - 1 ? "bg-red-400" : "bg-primary/50"}`}
                    style={{ width: `${(row.val / kpiMax) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-900">
                {row.val.toLocaleString()} {kpiOpt.unit}
              </span>
              {/* Rank delta */}
              <span className={`flex w-8 shrink-0 items-center justify-end gap-0.5 text-xs font-semibold ${
                row.delta > 0 ? "text-emerald-600" : row.delta < 0 ? "text-red-500" : "text-slate-300"
              }`}>
                {row.delta > 0 ? <ArrowUp className="h-3 w-3" /> : row.delta < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(row.delta) > 0 ? Math.abs(row.delta) : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h3 className="text-lg font-bold text-slate-900">상위·하위 매장 격차 분석</h3>
        <p className="mt-0.5 text-sm text-slate-500">5개 지표 전체 기준 상위 1위 vs 하위 1위 격차입니다.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {kpiOptions.map((opt) => {
            const vals = kpiValues[opt.value];
            const sorted = [...vals].sort((a, b) => b - a);
            const g = sorted[0] - sorted[sorted.length - 1];
            const gp = Math.round((g / sorted[sorted.length - 1]) * 100);
            return (
              <div key={opt.value} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                <p className="text-xs font-medium text-slate-400">{opt.label} 격차</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {g.toLocaleString()}{opt.unit}
                </p>
                <p className="text-xs text-red-600">하위 대비 +{gp}%</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-700">1위 매장: {topStore.name}</p>
            <p className="mt-1 text-sm text-emerald-800">
              피크타임 회전율과 객단가가 높아 우수한 성과를 유지합니다. 시간대별 프로모션 운영이 핵심입니다.
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-600">최하위 매장: {bottomStore.name}</p>
            <p className="mt-1 text-sm text-red-800">
              이탈 고객 비중이 높고 공지 이행률이 낮습니다. 집중 코칭과 방문 리포트 기반 개선이 필요합니다.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
          <p className="text-xs font-semibold text-slate-700">AI 원인 해석</p>
          <p className="mt-1.5 text-sm text-slate-600">
            현재 {kpiOpt.label} 기준 상위-하위 격차는 <strong>{gap.toLocaleString()}{kpiOpt.unit}</strong>
            (하위 대비 +{gapPct}%)입니다. 핵심 격차 요인은{" "}
            <strong>시간대별 프로모션 운영 여부</strong>와 <strong>직원 서비스 품질</strong>로 분석됩니다.
          </p>
          <button className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            개선 액션 확인
          </button>
        </div>
      </section>
    </div>
  );
};