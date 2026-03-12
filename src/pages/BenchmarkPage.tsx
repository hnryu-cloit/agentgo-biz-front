import type React from "react";
import { useState } from "react";
import { BarChart2, MapPin, TrendingUp, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CompareStore = {
  id: string;
  name: string;
  area: string;
  brand: string;
  size: "소형" | "중형" | "대형";
  unitPrice: number;
  turnover: number;
  cancelRate: number;
  margin: number;
  selected: boolean;
};

const allStores: CompareStore[] = [
  { id: "b1", name: "강남역점", area: "도심 오피스", brand: "동일", size: "중형", unitPrice: 8200, turnover: 4.2, cancelRate: 2.1, margin: 24.3, selected: true },
  { id: "b2", name: "홍대입구점", area: "상업지구", brand: "동일", size: "소형", unitPrice: 7800, turnover: 3.8, cancelRate: 2.8, margin: 22.1, selected: true },
  { id: "b3", name: "신촌점", area: "대학가", brand: "동일", size: "소형", unitPrice: 7200, turnover: 3.5, cancelRate: 3.2, margin: 21.4, selected: true },
  { id: "b4", name: "여의도점", area: "도심 오피스", brand: "동일", size: "대형", unitPrice: 10200, turnover: 5.1, cancelRate: 1.5, margin: 27.8, selected: false },
  { id: "b5", name: "건대점", area: "주거상권", brand: "타사유사", size: "소형", unitPrice: 6800, turnover: 2.9, cancelRate: 4.1, margin: 19.2, selected: false },
];

const myStore = {
  name: "내 매장",
  unitPrice: 7016,
  turnover: 2.4,
  cancelRate: 4.2,
  margin: 18.1,
};

type MetricKey = "unitPrice" | "turnover" | "cancelRate" | "margin";

const metricDefs: { key: MetricKey; label: string; unit: string; higherIsBetter: boolean; tooltip: string }[] = [
  { key: "unitPrice", label: "객단가", unit: "원", higherIsBetter: true, tooltip: "1회 방문당 평균 결제 금액" },
  { key: "turnover", label: "좌석 회전율", unit: "회/일", higherIsBetter: true, tooltip: "하루 평균 좌석 사용 횟수" },
  { key: "cancelRate", label: "취소율", unit: "%", higherIsBetter: false, tooltip: "전체 주문 대비 취소 비율" },
  { key: "margin", label: "마진율", unit: "%", higherIsBetter: true, tooltip: "매출 대비 순이익 비율" },
];

const actionRecs = [
  { label: "취소율 개선", desc: "주문 후 15분 내 픽업 독려 알림 설정", impact: "취소율 -1.2%p 기대", difficulty: "쉬움" },
  { label: "비피크 객수 확대", desc: "14~17시 타임 프로모션 운영 (세트A)", impact: "비피크 객수 +18% 기대", difficulty: "보통" },
  { label: "마진 개선", desc: "마진 하락 메뉴 2종 가격 시뮬레이션 후 조정", impact: "마진율 +2.1%p 기대", difficulty: "보통" },
];

export const BenchmarkPage: React.FC = () => {
  const [stores, setStores] = useState(allStores);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("unitPrice");

  const selected = stores.filter((s) => s.selected);

  const toggleStore = (id: string) => {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const metric = metricDefs.find((m) => m.key === activeMetric)!;
  const bestVal = Math.max(...selected.map((s) => s[activeMetric] as number));

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <p className="text-sm font-semibold text-primary">성과 분석</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">매장 벤치마크</h2>
        <p className="mt-1 text-base text-slate-500">
          유사 상권·브랜드 매장과 핵심 지표를 비교하고 개선 우선순위를 파악합니다.
        </p>
      </section>

      {/* Store Selector */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#EEF4FF] p-1.5 shadow-sm">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">비교 매장 선택</h3>
          <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-slate-400">Min. 3 Stores Required</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleStore(s.id)}
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all shadow-sm hover:shadow-md",
                s.selected
                  ? "border-[#CFE0FF] bg-[#F7FAFF]"
                  : "border-[#DCE4F3] bg-white hover:border-primary/30"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors shadow-sm",
                s.selected ? "border-primary bg-primary" : "border-[#DCE4F3] bg-white group-hover:border-primary/50"
              )}>
                {s.selected && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-bold transition-colors",
                  s.selected ? "text-[#2454C8]" : "text-slate-800"
                )}>
                  {s.name}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400 leading-tight">
                  {s.area} · {s.brand} · {s.size}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selected.length < 3 && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 shadow-sm animate-pulse">
            비교 매장을 {3 - selected.length}개 더 선택해 주세요.
          </div>
        )}
      </section>

      {/* Metric Comparison */}
      {selected.length >= 3 && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-1.5">
                <BarChart2 className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">지표 비교</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metricDefs.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  title={m.tooltip}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[13px] font-bold shadow-sm transition-all",
                    activeMetric === m.key
                      ? "border-[#CFE0FF] bg-[#EEF4FF] text-[#2454C8]"
                      : "border-[#D6E0F0] bg-white text-slate-500 hover:bg-[#F8FAFF]"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5 w-fit px-2 py-0.5 rounded">
            <Info className="h-3 w-3" />
            {metric.tooltip}
          </div>

          <div className="mt-6 space-y-4">
            {/* My Store */}
            <div className="flex items-center gap-4 rounded-xl border border-[#CFE0FF] bg-[#F7FAFF] p-3 shadow-sm">
              <span className="w-24 shrink-0 rounded-full border border-[#CFE0FF] bg-white px-2 py-1 text-center text-[11px] font-bold text-[#2454C8] shadow-sm">
                내 매장
              </span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
                  <div
                    className="h-full rounded-full bg-primary shadow-sm transition-all duration-700"
                    style={{ width: `${((myStore[activeMetric] as number) / bestVal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex w-32 shrink-0 items-center justify-end gap-3">
                <span className="text-sm font-bold text-slate-900">
                  {typeof myStore[activeMetric] === "number" && metric.unit === "원"
                    ? (myStore[activeMetric] as number).toLocaleString()
                    : myStore[activeMetric]}
                  <span className="ml-0.5 text-xs text-slate-400 font-medium">{metric.unit !== "원" ? metric.unit : "원"}</span>
                </span>
                {(() => {
                  const delta = (((myStore[activeMetric] as number) - bestVal) / bestVal) * 100;
                  const good = metric.higherIsBetter ? delta >= 0 : delta <= 0;
                  return (
                    <span className={cn(
                      "flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                      good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {good ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {Math.abs(delta).toFixed(0)}%
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-3 px-1">
              {selected.map((s) => {
                const val = s[activeMetric] as number;
                const pct = (val / bestVal) * 100;
                const isBest = val === bestVal;
                return (
                  <div key={s.id} className="flex items-center gap-4">
                    <span className="w-24 shrink-0 truncate text-xs font-bold text-slate-500">{s.name}</span>
                    <div className="flex-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            isBest ? "bg-emerald-400 shadow-sm" : "bg-slate-300"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex w-32 shrink-0 items-center justify-end gap-3">
                      <span className="text-sm font-bold text-slate-700">
                        {metric.unit === "원" ? val.toLocaleString() : val}
                        <span className="ml-0.5 text-[10px] text-slate-400 font-medium">{metric.unit !== "원" ? metric.unit : "원"}</span>
                      </span>
                      {isBest ? (
                        <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                          TOP
                        </span>
                      ) : (
                        <span className="w-8" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Action Recommendations */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-1.5 shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">벤치마크 기반 개선 액션</h3>
        </div>
        <p className="mt-1 text-base text-slate-500">격차가 큰 지표 중심으로 AI가 제안하는 실행 가능한 개선안입니다.</p>

        <div className="mt-5 space-y-3">
          {actionRecs.map((rec) => (
            <div key={rec.label} className="group flex items-start gap-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
              <div className="flex-1">
                <p className="text-[15px] font-bold text-slate-800">{rec.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">{rec.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 shadow-sm">
                    {rec.impact}
                  </span>
                  <span className="rounded-full border border-[#DCE4F3] bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-400 shadow-sm">
                    난이도: {rec.difficulty}
                  </span>
                </div>
              </div>
              <button className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95">
                저장하기
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};