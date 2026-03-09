import type React from "react";
import { useState } from "react";
import { BarChart2, MapPin, TrendingUp, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">매장 벤치마크</h2>
        <p className="mt-1 text-sm text-slate-500">
          유사 상권·브랜드 매장과 핵심 지표를 비교하고 개선 우선순위를 파악합니다.
        </p>
      </section>

      {/* Store Selector */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">비교 매장 선택</h3>
          <span className="ml-auto text-sm text-slate-500">최소 3개 선택</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleStore(s.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                s.selected
                  ? "border-[#BFD4FF] bg-[#EEF4FF]"
                  : "border-[#DCE4F3] bg-white hover:bg-[#F7FAFF]"
              }`}
            >
              <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${s.selected ? "border-primary bg-primary" : "border-[#DCE4F3] bg-white"}`}>
                {s.selected && <span className="text-[10px] font-bold text-white">✓</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{s.area} · {s.brand} · {s.size}</p>
              </div>
            </button>
          ))}
        </div>

        {selected.length < 3 && (
          <p className="mt-3 text-xs text-amber-600">비교 매장을 {3 - selected.length}개 더 선택해 주세요.</p>
        )}
      </section>

      {/* Metric Comparison */}
      {selected.length >= 3 && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">지표 비교</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {metricDefs.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  title={m.tooltip}
                  className={
                    activeMetric === m.key
                      ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1.5 text-sm font-semibold text-primary"
                      : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-sm text-slate-600"
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Info className="h-3 w-3" />
            {metric.tooltip}
          </p>

          <div className="mt-5 space-y-3">
            {/* My Store */}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 rounded-full border border-[#BFD4FF] bg-[#EEF4FF] px-2 py-0.5 text-center text-xs font-bold text-primary">
                내 매장
              </span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${((myStore[activeMetric] as number) / bestVal) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-bold text-slate-900">
                {typeof myStore[activeMetric] === "number" && metric.unit === "원"
                  ? (myStore[activeMetric] as number).toLocaleString()
                  : myStore[activeMetric]}
                {metric.unit !== "원" ? metric.unit : "원"}
              </span>
              {(() => {
                const delta = (((myStore[activeMetric] as number) - bestVal) / bestVal) * 100;
                const good = metric.higherIsBetter ? delta >= 0 : delta <= 0;
                return (
                  <span className={`flex items-center text-xs font-semibold ${good ? "text-emerald-600" : "text-red-600"}`}>
                    {good ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {delta.toFixed(0)}%
                  </span>
                );
              })()}
            </div>

            {selected.map((s, idx) => {
              const val = s[activeMetric] as number;
              const pct = (val / bestVal) * 100;
              const delta = ((val - (myStore[activeMetric] as number)) / (myStore[activeMetric] as number)) * 100;
              const isBest = val === bestVal;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-xs text-slate-600">{s.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                      <div
                        className={`h-full rounded-full ${isBest ? "bg-emerald-400" : "bg-slate-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-700">
                    {metric.unit === "원" ? val.toLocaleString() : val}
                    {metric.unit !== "원" ? metric.unit : "원"}
                  </span>
                  {isBest && (
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      1위
                    </span>
                  )}
                  {!isBest && <span className="w-10" />}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Action Recommendations */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">벤치마크 기반 개선 액션</h3>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">격차가 큰 지표 중심으로 실행 가능한 개선안을 제시합니다.</p>

        <div className="mt-4 space-y-3">
          {actionRecs.map((rec) => (
            <div key={rec.label} className="flex items-start gap-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{rec.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{rec.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {rec.impact}
                  </span>
                  <span className="rounded border border-[#DCE4F3] bg-white px-2 py-0.5 text-xs text-slate-500">
                    난이도: {rec.difficulty}
                  </span>
                </div>
              </div>
              <button className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                저장
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};