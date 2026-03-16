import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSvStores, type StoreRiskSummary } from "@/services/supervisor";

type KpiMetric = "sales_total" | "avg_order_value" | "risk_score" | "cancel_rate";
type Period = "이번주" | "이번달" | "전달";

const kpiOptions: { value: KpiMetric; label: string; unit: string }[] = [
  { value: "sales_total", label: "매출", unit: "원" },
  { value: "avg_order_value", label: "객단가", unit: "원" },
  { value: "risk_score", label: "리스크", unit: "점" },
  { value: "cancel_rate", label: "취소율", unit: "%" },
];

export const SvAnalysisPage: React.FC = () => {
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric>("sales_total");
  const [period, setPeriod] = useState<Period>("이번주");
  const [stores, setStores] = useState<StoreRiskSummary[]>([]);

  useEffect(() => {
    let alive = true;
    getSvStores()
      .then((response) => {
        if (!alive) return;
        setStores(response);
      })
      .catch(() => {
        if (!alive) return;
        setStores([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const kpiOpt = kpiOptions.find((option) => option.value === selectedKpi)!;

  const { ranked, kpiMax, topStore, bottomStore, gap, gapPct } = useMemo(() => {
    const sorted = [...stores]
      .map((store, index) => ({ ...store, delta: stores.length - index - 1 }))
      .sort((a, b) => (b[selectedKpi] as number) - (a[selectedKpi] as number));
    const max = Math.max(...sorted.map((store) => store[selectedKpi] as number), 1);
    const top = sorted[0] ?? null;
    const bottom = sorted[sorted.length - 1] ?? null;
    const computedGap = top && bottom ? (top[selectedKpi] as number) - (bottom[selectedKpi] as number) : 0;
    const computedGapPct = bottom && (bottom[selectedKpi] as number) !== 0 ? Math.round((computedGap / (bottom[selectedKpi] as number)) * 100) : 0;
    return { ranked: sorted, kpiMax: max, topStore: top, bottomStore: bottom, gap: computedGap, gapPct: computedGapPct };
  }, [selectedKpi, stores]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">구역 분석</p>
            <h2 className="text-2xl font-bold text-foreground">담당 매장 심층 분석</h2>
            <p className="mt-1 text-base text-muted-foreground">담당 구역 내 실데이터 KPI를 비교하고 성과 격차를 확인합니다.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1 shadow-sm">
            {(["이번주", "이번달", "전달"] as Period[]).map((option) => (
              <button
                key={option}
                onClick={() => setPeriod(option)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
                  period === option ? "bg-card text-[#2f66ff] shadow-sm" : "text-[var(--subtle-foreground)] hover:text-[#4a5568]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[var(--muted)] p-1.5 shadow-sm">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">매장별 KPI 랭킹</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--subtle-foreground)]">Select Metric</span>
            <select
              value={selectedKpi}
              onChange={(event) => setSelectedKpi(event.target.value as KpiMetric)}
              className="h-10 rounded-xl border border-[#d5deec] bg-card px-4 text-sm font-bold text-[#34415b] shadow-sm outline-none transition-all focus:border-primary/50"
            >
              {kpiOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label} ({option.unit})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 px-1">
          {ranked.map((row, idx) => (
            <div key={row.id} className="group flex items-center gap-4">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-sm", idx === 0 ? "border-primary bg-primary text-white" : idx === ranked.length - 1 ? "border-red-100 bg-red-50 text-red-600" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)]")}>
                {idx + 1}
              </span>
              <span className="w-20 shrink-0 text-sm font-bold text-[#34415b]">{row.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)] shadow-inner">
                  <div className={cn("h-full rounded-full shadow-sm transition-all duration-1000", idx === 0 ? "bg-primary" : idx === ranked.length - 1 ? "bg-red-400" : "bg-primary/40")} style={{ width: `${(((row[selectedKpi] as number) / kpiMax) * 100).toFixed(0)}%` }} />
                </div>
              </div>
              <div className="flex w-36 shrink-0 items-center justify-end gap-4">
                <span className="font-mono text-sm font-black text-foreground">
                  {(row[selectedKpi] as number).toLocaleString()} <span className="ml-0.5 text-[10px] font-bold text-[var(--subtle-foreground)]">{kpiOpt.unit}</span>
                </span>
                <span className={cn("flex w-10 shrink-0 items-center justify-end gap-0.5 font-mono text-xs font-black", idx === 0 ? "text-emerald-600" : idx === ranked.length - 1 ? "text-red-500" : "text-[#b0bdd4]")}>
                  {idx === 0 ? <ArrowUp className="h-3.5 w-3.5" /> : idx === ranked.length - 1 ? <ArrowDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </span>
              </div>
            </div>
          ))}
          {ranked.length === 0 && (
            <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 text-sm font-medium text-muted-foreground shadow-sm">
              표시할 매장 KPI 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <h3 className="text-lg font-bold text-foreground">매장 성과 격차 분석 (Top vs Bottom)</h3>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">선택한 KPI 기준 상위 매장과 하위 매장의 실질적인 격차입니다.</p>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {kpiOptions.map((option) => {
            const values = stores.map((store) => store[option.value] as number).sort((a, b) => b - a);
            const localGap = values.length > 1 ? values[0] - values[values.length - 1] : 0;
            const localGapPct = values.length > 1 && values[values.length - 1] !== 0 ? Math.round((localGap / values[values.length - 1]) * 100) : 0;
            return (
              <div key={option.value} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--subtle-foreground)]">{option.label} GAP</p>
                <p className="mt-2 text-xl font-black leading-none text-foreground">
                  {localGap.toLocaleString()}<span className="ml-0.5 text-xs opacity-40">{option.unit}</span>
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-black text-red-600">
                  <ArrowUp className="h-3 w-3" />
                  +{localGapPct}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
              <p className="text-xs font-black uppercase tracking-tighter text-emerald-700">Leading Store</p>
            </div>
            <p className="text-base font-black text-emerald-900">{topStore?.name ?? "-"}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-800">
              최신 집계 기준 {kpiOpt.label} 상위 매장입니다. 현재 값은 <span className="underline decoration-emerald-200 decoration-2">{topStore ? (topStore[selectedKpi] as number).toLocaleString() : 0}{kpiOpt.unit}</span> 입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
              <p className="text-xs font-black uppercase tracking-tighter text-red-700">Underperforming Store</p>
            </div>
            <p className="text-base font-black text-red-900">{bottomStore?.name ?? "-"}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-red-800">
              선택 KPI 기준 하위 매장입니다. 우선순위 코칭 대상 후보로 보고 취소율과 객단가를 함께 점검하는 편이 맞습니다.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#c9d8ff] bg-[#f4f7ff] p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-[#2f66ff] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">AI INSIGHT</span>
            <p className="text-sm font-bold text-[#2f66ff]">원인 해석 및 제언</p>
          </div>
          <p className="text-sm font-medium leading-relaxed text-[#4a5568]">
            현재 {kpiOpt.label} 기준 상위-하위 격차는 <strong className="text-foreground">{gap.toLocaleString()}{kpiOpt.unit}</strong> (+{gapPct}%)입니다.
            리스크 점수와 취소율을 함께 보면 현장 코칭 우선순위를 더 명확하게 잡을 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
};
