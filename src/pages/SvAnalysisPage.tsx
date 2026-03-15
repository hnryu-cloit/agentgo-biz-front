import type React from "react";
import { useMemo, useState } from "react";
import { BarChart2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

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
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">구역 분석</p>
            <h2 className="text-2xl font-bold text-foreground">담당 매장 심층 분석</h2>
            <p className="mt-1 text-base text-muted-foreground">담당 구역 내 매장별 핵심 지표 비교 및 성과 랭킹을 모니터링합니다.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1 shadow-sm">
            {(["이번주", "이번달", "전달"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
                  period === p
                    ? "bg-card text-[#2f66ff] shadow-sm"
                    : "text-[var(--subtle-foreground)] hover:text-[#4a5568]"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Comparison */}
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[var(--muted)] p-1.5 shadow-sm">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">매장별 KPI 랭킹</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Select Metric</span>
            <select
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value as KpiMetric)}
              className="h-10 rounded-xl border border-[#d5deec] bg-card px-4 text-sm font-bold text-[#34415b] shadow-sm outline-none focus:border-primary/50 transition-all"
            >
              {kpiOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label} ({o.unit})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 px-1">
          {ranked.map((row, idx) => (
            <div key={row.name} className="flex items-center gap-4 group">
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm border",
                idx === 0 ? "bg-primary border-primary text-white" : 
                idx === ranked.length - 1 ? "bg-red-50 border-red-100 text-red-600" : 
                "bg-card border-[var(--border)] text-[var(--subtle-foreground)]"
              )}>
                {idx + 1}
              </span>
              <span className="w-20 shrink-0 text-sm font-bold text-[#34415b]">{row.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)] shadow-inner">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 shadow-sm",
                      idx === 0 ? "bg-primary" : idx === ranked.length - 1 ? "bg-red-400" : "bg-primary/40"
                    )}
                    style={{ width: `${(row.val / kpiMax) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex w-36 shrink-0 items-center justify-end gap-4">
                <span className="text-sm font-black text-foreground font-mono">
                  {row.val.toLocaleString()} <span className="text-[10px] text-[var(--subtle-foreground)] font-bold ml-0.5">{kpiOpt.unit}</span>
                </span>
                <span className={cn(
                  "flex w-10 shrink-0 items-center justify-end gap-0.5 text-xs font-black font-mono",
                  row.delta > 0 ? "text-emerald-600" : row.delta < 0 ? "text-red-500" : "text-[#b0bdd4]"
                )}>
                  {row.delta > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : row.delta < 0 ? <ArrowDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  {Math.abs(row.delta) > 0 ? Math.abs(row.delta) : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="app-card p-5 md:p-6">
        <h3 className="text-lg font-bold text-foreground">매장 성과 격차 분석 (Top vs Bottom)</h3>
        <p className="mt-1 text-sm text-muted-foreground mb-6">주요 지표별 최상위 매장과 최하위 매장의 실질적인 성과 차이입니다.</p>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {kpiOptions.map((opt) => {
            const vals = kpiValues[opt.value];
            const sorted = [...vals].sort((a, b) => b - a);
            const g = sorted[0] - sorted[sorted.length - 1];
            const gp = Math.round((g / sorted[sorted.length - 1]) * 100);
            return (
              <div key={opt.value} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">{opt.label} GAP</p>
                <p className="mt-2 text-xl font-black text-foreground leading-none">
                  {g.toLocaleString()}<span className="text-xs ml-0.5 opacity-40">{opt.unit}</span>
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-black text-red-600">
                  <ArrowUp className="h-3 w-3" />
                  +{gp}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
              <p className="text-xs font-black text-emerald-700 uppercase tracking-tighter">Leading Store</p>
            </div>
            <p className="text-base font-black text-emerald-900">{topStore.name}</p>
            <p className="mt-2 text-sm text-emerald-800 leading-relaxed font-medium">
              피크타임 회전율과 객단가가 높아 우수한 성과를 유지합니다. <span className="underline decoration-emerald-200 decoration-2">시간대별 프로모션 운영</span>이 핵심 성공 요인입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
              <p className="text-xs font-black text-red-700 uppercase tracking-tighter">Underperforming Store</p>
            </div>
            <p className="text-base font-black text-red-900">{bottomStore.name}</p>
            <p className="mt-2 text-sm text-red-800 leading-relaxed font-medium">
              이탈 고객 비중이 높고 공지 이행률이 낮습니다. <span className="underline decoration-red-200 decoration-2">집중 현장 코칭</span>과 AI 리포트 기반의 선별적 개선이 시급합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#c9d8ff] bg-[#f4f7ff] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-lg bg-[#2f66ff] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">AI INSIGHT</span>
            <p className="text-sm font-bold text-[#2f66ff]">원인 해석 및 제언</p>
          </div>
          <p className="text-sm font-medium text-[#4a5568] leading-relaxed">
            현재 {kpiOpt.label} 기준 상위-하위 격차는 <strong className="text-foreground">{gap.toLocaleString()}{kpiOpt.unit}</strong> (+{gapPct}%)입니다. 
            주요 분석 결과, <span className="font-bold text-[#1a2138] underline underline-offset-4 decoration-[#c9d8ff] decoration-2">직원 서비스 품질 지수</span>가 매출 격차의 42%를 설명하고 있습니다.
          </p>
          <button className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95">
            개선 액션 가이드 확인하기
          </button>
        </div>
      </section>
    </div>
  );
};