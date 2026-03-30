import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, Info, MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import {
  getBenchmarkActions,
  getBenchmarkStores,
  type BenchmarkAction,
  type BenchmarkStoreSummary,
} from "@/services/analysis";

type MetricKey = "sales_total" | "margin_rate" | "review_score" | "similarity_score";

const metricDefs: { key: MetricKey; label: string; unit: string; tooltip: string }[] = [
  { key: "sales_total", label: "매출", unit: "원", tooltip: "최신 실데이터 기준 매출 총액" },
  { key: "margin_rate", label: "마진율", unit: "%", tooltip: "순매출 비중 기반 마진 지표" },
  { key: "review_score", label: "품질 점수", unit: "점", tooltip: "환불 비중 기반 운영 품질 점수" },
  { key: "similarity_score", label: "유사도", unit: "%", tooltip: "기준 매장 대비 매출 유사도" },
];

export const BenchmarkPage: React.FC = () => {
  const [stores, setStores] = useState<BenchmarkStoreSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [actions, setActions] = useState<BenchmarkAction[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("sales_total");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    getBenchmarkStores()
      .then((response) => {
        if (!alive) return;
        setStores(response);
        setSelectedStoreId(response[0]?.store_id ?? null);
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "벤치마크 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStoreId) {
      return;
    }
    let alive = true;
    getBenchmarkActions(selectedStoreId)
      .then((response) => {
        if (!alive) return;
        setActions(response.recommended_actions);
      })
      .catch(() => {
        if (!alive) return;
        setActions([]);
      });
    return () => {
      alive = false;
    };
  }, [selectedStoreId]);

  const selectedStore = stores.find((store) => store.store_id === selectedStoreId) ?? null;
  const visibleActions = selectedStoreId ? actions : [];
  const metric = metricDefs.find((item) => item.key === activeMetric)!;
  const metricValue = (store: BenchmarkStoreSummary, key: MetricKey): number => {
    const value = store[key];
    return typeof value === "number" ? value : 0;
  };
  const hasMetricData = stores.some((store) => typeof store[activeMetric] === "number");
  const bestValue = Math.max(...stores.map((store) => metricValue(store, activeMetric)), 1);

  const sortedStores = useMemo(
    () => [...stores].sort((a, b) => metricValue(b, activeMetric) - metricValue(a, activeMetric)),
    [activeMetric, stores],
  );

  if (isLoading) {
    return <LoadingState message="벤치마크 데이터를 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="벤치마크 데이터를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <p className="text-sm font-semibold text-primary">성과 분석</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">매장 벤치마크</h2>
        <p className="mt-1 text-base text-muted-foreground">최신 일자 실데이터 기준으로 유사 매장 성과와 개선 우선순위를 비교합니다.</p>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#eef3ff] p-1.5 shadow-sm">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">기준 매장 선택</h3>
        </div>

        <div className="mt-5">
          {stores.length === 0 ? (
            <EmptyState
              title="비교 가능한 매장이 없습니다"
              description="최신 실데이터가 적재된 매장이 없어 벤치마크 목록을 만들 수 없습니다."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <button
                  key={store.store_id}
                  onClick={() => setSelectedStoreId(store.store_id)}
                  className={cn(
                    "rounded-xl border p-3.5 text-left shadow-sm transition-all hover:shadow-md",
                    selectedStoreId === store.store_id
                      ? "border-[#c9d8ff] bg-[#f4f7ff]"
                      : "border-[#d5deec] bg-card hover:border-primary/30",
                  )}
                >
                  <p className={cn("text-sm font-bold", selectedStoreId === store.store_id ? "text-[#2f66ff]" : "text-[#1a2138]")}>
                    {store.store_name}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-tight text-[var(--subtle-foreground)]">
                    {store.region} · 유사도 {store.similarity_score.toFixed(1)}%
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedStore && (
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated animate-in fade-in zoom-in-95 p-5 md:p-6 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[var(--muted)] p-1.5">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">지표 비교</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metricDefs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveMetric(item.key)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[13px] font-bold shadow-sm transition-all",
                    activeMetric === item.key
                      ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                      : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex w-fit items-center gap-1.5 rounded bg-primary/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Info className="h-3 w-3" />
            {metric.tooltip}
          </div>

          <div className="mt-6 space-y-4">
            {!hasMetricData ? (
              <EmptyState
                title="표시할 지표 데이터가 없습니다"
                description="선택한 지표는 현재 비교 가능한 실데이터가 없어 표시할 수 없습니다."
              />
            ) : (
              <>
                <div className="flex items-center gap-4 rounded-xl border border-[#c9d8ff] bg-[#f4f7ff] p-3 shadow-sm">
                  <span className="w-24 shrink-0 rounded-full border border-[#c9d8ff] bg-card px-2 py-1 text-center text-[11px] font-bold text-[#2f66ff] shadow-sm">
                    기준 매장
                  </span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                      <div
                        className="h-full rounded-full bg-primary shadow-sm transition-all duration-700"
                        style={{ width: `${((metricValue(selectedStore, activeMetric) / bestValue) * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-32 shrink-0 text-right text-sm font-bold text-foreground">
                    {selectedStore[activeMetric] == null ? "데이터 없음" : metricValue(selectedStore, activeMetric).toLocaleString()}
                    {selectedStore[activeMetric] != null && (
                      <span className="ml-0.5 text-xs font-medium text-[var(--subtle-foreground)]">{metric.unit}</span>
                    )}
                  </span>
                </div>

                <div className="space-y-3 px-1">
                  {sortedStores.map((store) => {
                    const rawValue = store[activeMetric];
                    const value = metricValue(store, activeMetric);
                    const pct = (value / bestValue) * 100;
                    return (
                      <div key={store.store_id} className="flex items-center gap-4">
                        <span className="w-24 shrink-0 truncate text-xs font-bold text-muted-foreground">{store.store_name}</span>
                        <div className="flex-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", store.store_id === selectedStoreId ? "bg-primary shadow-sm" : "bg-slate-300")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-32 shrink-0 text-right text-sm font-bold text-[#34415b]">
                          {rawValue == null ? "데이터 없음" : value.toLocaleString()}
                          {rawValue != null && (
                            <span className="ml-0.5 text-[10px] font-medium text-[var(--subtle-foreground)]">{metric.unit}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-1.5 shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">벤치마크 기반 개선 액션</h3>
        </div>
        <p className="mt-1 text-base text-muted-foreground">평균 대비 격차가 큰 지표 중심으로 생성한 운영 개선 제안입니다.</p>

        <div className="mt-5 space-y-3">
          {visibleActions.map((action) => (
            <div key={action.title} className="group flex items-start gap-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#1a2138]">{action.title}</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">{action.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-card px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 shadow-sm">
                    {action.expected_impact}
                  </span>
                  <span className="rounded-full border border-[#d5deec] bg-card px-2.5 py-0.5 text-[11px] font-bold text-[var(--subtle-foreground)] shadow-sm">
                    우선순위: {action.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {visibleActions.length === 0 && (
            <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 text-sm font-medium text-muted-foreground shadow-sm">
              현재 기준 매장에 대한 추천 액션이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
