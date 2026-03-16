import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart2, CheckSquare, MapPin, Megaphone, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSvDashboard, getSvStores, type StoreRiskSummary, type SvDashboard } from "@/services/supervisor";

const emptyDashboard: SvDashboard = {
  total_stores: 0,
  p0_alert_count: 0,
  avg_cancel_rate: 0,
  low_margin_store_count: 0,
};

export const SupervisorDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<SvDashboard>(emptyDashboard);
  const [stores, setStores] = useState<StoreRiskSummary[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([getSvDashboard(), getSvStores()])
      .then(([dashboardResponse, storeResponse]) => {
        if (!alive) return;
        setDashboard(dashboardResponse);
        setStores(storeResponse);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(emptyDashboard);
        setStores([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      danger: stores.filter((store) => store.risk_score >= 10 || (store.cancel_rate ?? 0) >= 4).length,
      warning: stores.filter((store) => store.risk_score >= 5 && store.risk_score < 10).length,
      normal: stores.filter((store) => store.risk_score < 5).length,
    }),
    [stores],
  );

  const avgDelta = useMemo(() => {
    if (stores.length === 0) return "0.0";
    return (stores.reduce((acc, store) => acc + (store.sales_delta_pct ?? 0), 0) / stores.length).toFixed(1);
  }, [stores]);

  const topDangerStores = useMemo(
    () => stores.slice().sort((a, b) => b.risk_score - a.risk_score).slice(0, 2).map((store) => store.name).join(", "),
    [stores],
  );

  const maxSales = Math.max(...stores.map((store) => store.sales_total ?? 0), 1);

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">SV 모닝 브리핑</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">최신 실데이터 기준 구역 상태</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#DCE4F3] bg-white p-3">
            <p className="text-xs font-medium text-slate-500">구역 전일 실적</p>
            <p className="mt-1 text-sm font-bold text-slate-900">평균 매출 증감 {avgDelta}%</p>
            <p className="text-xs text-red-500">관리 매장 {dashboard.total_stores}개</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-700">오늘 주요 이슈</p>
            <p className="mt-1 text-sm font-bold text-slate-900">P0 경보 {dashboard.p0_alert_count}건</p>
            <p className="text-xs text-red-600">취소율 평균 {(dashboard.avg_cancel_rate * 100).toFixed(2)}%</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700">마진 주의 매장</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{dashboard.low_margin_store_count}곳</p>
            <p className="text-xs text-amber-600">우선 코칭 후보</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs font-semibold text-primary">
                관리 매장 {dashboard.total_stores}개
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">수퍼바이저 보드</h2>
            <p className="mt-1 text-base text-slate-500">실제 resource 집계 기준으로 위험도와 매출 흐름을 확인합니다.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">고위험 매장 {stats.danger}곳</p>
              <p className="text-xs text-slate-500">긴급 현장 방문이 필요합니다</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "위험 매장", count: stats.danger, color: "red", desc: "즉시 개입 필요" },
          { label: "주의 매장", count: stats.warning, color: "amber", desc: "모니터링 강화" },
          { label: "정상 매장", count: stats.normal, color: "emerald", desc: "현재 안정적" },
        ].map((item) => (
          <article
            key={item.label}
            className={cn(
              "rounded-2xl border bg-card p-5 shadow-sm",
              item.color === "red" ? "border-red-200" : item.color === "amber" ? "border-amber-200" : "border-emerald-200",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <span className={cn("h-2.5 w-2.5 rounded-full", item.color === "red" ? "bg-red-400" : item.color === "amber" ? "bg-amber-400" : "bg-emerald-400")} />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.count}개</p>
            <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">구역 평균 매출 증감</p>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{avgDelta}%</p>
          <p className="mt-1 text-xs text-slate-500">최근 비교 기준</p>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">평균 취소율</p>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{(dashboard.avg_cancel_rate * 100).toFixed(2)}%</p>
          <p className="mt-1 text-xs text-slate-500">전 매장 평균</p>
        </article>

        <article className="rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">AI 추천 금주 방문지</p>
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{topDangerStores || "-"}</p>
          <p className="mt-1 text-xs text-slate-500">위험도 상위 매장</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">매장 매출 비교</h3>
        </div>
        <div className="mt-4 space-y-3">
          {stores.map((store) => (
            <div key={store.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-medium text-slate-700">{store.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(((store.sales_total ?? 0) / maxSales) * 100)}%` }} />
                </div>
              </div>
              <span className="w-28 shrink-0 text-right text-sm font-semibold text-slate-900">{(store.sales_total ?? 0).toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">매장별 위험도 분석</h3>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-3 py-3">매장</th>
                <th className="px-3 py-3">매출 증감</th>
                <th className="px-3 py-3">평균 객단가</th>
                <th className="px-3 py-3">취소율</th>
                <th className="px-3 py-3">리스크</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stores.map((store) => (
                <tr key={store.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">{store.name}</td>
                  <td className={cn("px-3 py-3 font-medium", (store.sales_delta_pct ?? 0) >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {(store.sales_delta_pct ?? 0) >= 0 ? "+" : ""}{store.sales_delta_pct ?? 0}%
                  </td>
                  <td className="px-3 py-3 text-slate-600">{(store.avg_order_value ?? 0).toLocaleString()}원</td>
                  <td className="px-3 py-3 text-slate-600">{(store.cancel_rate ?? 0).toFixed(2)}%</td>
                  <td className={cn("px-3 py-3 font-bold", store.risk_score >= 10 ? "text-red-600" : store.risk_score >= 5 ? "text-amber-600" : "text-emerald-600")}>
                    {store.risk_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
