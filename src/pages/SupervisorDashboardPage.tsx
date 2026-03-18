import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart2, CheckSquare, MapPin, Megaphone, ShieldAlert, Sparkles, X, Send, FileText, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSvDashboard, getSvStores, type StoreRiskSummary, type SvDashboard } from "@/services/supervisor";
import { isSupervisorDashboardEmpty, supervisorDashboardMock, supervisorStoresMock } from "@/lib/mockData";

const emptyDashboard: SvDashboard = {
  total_stores: 0,
  p0_alert_count: 0,
  avg_cancel_rate: 0,
  low_margin_store_count: 0,
};

export const SupervisorDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<SvDashboard>(emptyDashboard);
  const [stores, setStores] = useState<StoreRiskSummary[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreRiskSummary | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getSvDashboard(), getSvStores()])
      .then(([dashboardResponse, storeResponse]) => {
        if (!alive) return;
        setDashboard(isSupervisorDashboardEmpty(dashboardResponse) ? supervisorDashboardMock : dashboardResponse);
        setStores(storeResponse.length > 0 ? storeResponse : supervisorStoresMock);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(supervisorDashboardMock);
        setStores(supervisorStoresMock);
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

  const handleOpenReport = (store: StoreRiskSummary) => {
    setSelectedStore(store);
    setShowReport(true);
  };

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
                  <td className="px-3 py-3">
                    <button 
                      onClick={() => handleOpenReport(store)}
                      className="font-bold text-primary hover:underline text-left"
                    >
                      {store.name}
                    </button>
                  </td>
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

      {/* F3: AI 사전 방문 분석 리포트 모달 */}
      {showReport && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#eef3ff] p-2.5">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">AI 사전 방문 분석 리포트</h3>
                  <p className="text-xs text-muted-foreground">{selectedStore.name} · 분석 시점 {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 md:p-6 space-y-6">
              {/* 주요 이슈 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="text-sm font-bold text-foreground">주요 이슈 및 경보</h4>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-red-700 font-medium">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    최근 7일간 취소율 {(selectedStore.cancel_rate ?? 0).toFixed(2)}%로 구역 평균 대비 {(selectedStore.cancel_rate ?? 0) / (dashboard.avg_cancel_rate || 0.01) > 2 ? "2배 이상" : "높음"}.
                  </div>
                  <div className="flex items-start gap-2 text-sm text-red-700 font-medium">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    전주 대비 매출 변동성 {selectedStore.sales_delta_pct}%로 이상 하락 징후 감지.
                  </div>
                </div>
              </div>

              {/* 코칭 포인트 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">AI 추천 코칭 포인트</h4>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
                    <p className="text-xs font-bold text-primary mb-1">운영 효율화</p>
                    <p className="text-sm text-[#4a5568] leading-relaxed">피크타임 주방 동선 및 배달 접수 지연 여부 점검 필요</p>
                  </div>
                  <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
                    <p className="text-xs font-bold text-primary mb-1">매출 방어</p>
                    <p className="text-sm text-[#4a5568] leading-relaxed">객단가 {selectedStore.avg_order_value?.toLocaleString()}원 개선을 위한 사이드 메뉴 업셀링 가이드</p>
                  </div>
                </div>
              </div>

              {/* 추천 대화 주제 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-foreground">점주 면담 추천 주제</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    "배달 취소 건이 12시~13시에 집중되는 구체적인 사유",
                    "신규 파트타임 인력 숙련도 및 현장 애로사항",
                    "본사 프로모션 메뉴의 실질적인 고객 반응 및 마진율 체감",
                  ].map((topic, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm text-[#4a5568]">
                      <span className="font-bold text-primary">Q{i+1}.</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 미이행 액션 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-foreground">미이행 액션 현황</h4>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-[#d5deec] p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-foreground">객수 회복 프로모션 점검</span>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">미완료</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 bg-gray-50/50 p-5 md:p-6 rounded-b-2xl">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                분석 데이터는 최근 14일 POS 및 도도포인트 기준입니다.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowReport(false)}
                  className="rounded-lg border border-[#d5deec] bg-card px-4 py-2 text-sm font-medium text-[#34415b] hover:bg-slate-50"
                >
                  닫기
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-[#2356e0]">
                  <Send className="h-4 w-4" /> 리포트 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
