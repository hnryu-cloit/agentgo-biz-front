import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  History,
  Save,
  Search,
  ClipboardCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInventoryItems, getInventorySummary, getTheoreticalInventory, getMenuCosts } from "@/services/inventory";
import { getOwnerDashboard } from "@/services/owner";

type Category = "전체" | "육류/어패류" | "채소/과일" | "양념/소스" | "건식품/곡류";
type StockItem = {
  id: string;
  name: string;
  category: Exclude<Category, "전체">;
  unit: string;
  theoretical: number;
  actual: number | null;
  note: string;
};
type HistoryEntry = {
  id: string;
  month: string;
  store: string;
  totalItems: number;
  normalCount: number;
  shortageCount: number;
  surplusCount: number;
  avgLossRate: number;
  submittedAt: string;
};

const initialItems: StockItem[] = [
  { id: "cj-i01", name: "셰프의 마파박스", category: "양념/소스", unit: "세트", theoretical: 42, actual: 38, note: "소공점 메뉴 라인업 기준" },
  { id: "cj-i02", name: "셰프의 새우박스", category: "육류/어패류", unit: "세트", theoretical: 35, actual: 33, note: "소공점 메뉴 라인업 기준" },
  { id: "cj-i03", name: "셰프의 어향박스", category: "양념/소스", unit: "세트", theoretical: 30, actual: 28, note: "소공점 메뉴 라인업 기준" },
  { id: "cj-i04", name: "광동의점심상(2인)", category: "건식품/곡류", unit: "코스", theoretical: 18, actual: 16, note: "소공점 메뉴 라인업 기준" },
  { id: "cj-i05", name: "특선런치 A코스", category: "채소/과일", unit: "코스", theoretical: 12, actual: 11, note: "소공점 메뉴 라인업 기준" },
];

const historyData: HistoryEntry[] = [
  { id: "cj-h1", month: "2026-02", store: "크리스탈제이드 소공점", totalItems: 18, normalCount: 13, shortageCount: 4, surplusCount: 1, avgLossRate: 4.2, submittedAt: "2026-02-28 21:10" },
  { id: "cj-h2", month: "2026-01", store: "크리스탈제이드 소공점", totalItems: 18, normalCount: 14, shortageCount: 3, surplusCount: 1, avgLossRate: 3.6, submittedAt: "2026-01-31 20:45" },
];

const CATEGORIES: Category[] = ["전체", "육류/어패류", "채소/과일", "양념/소스", "건식품/곡류"];

function diffRate(theoretical: number, actual: number | null): number | null {
  if (actual === null) return null;
  return ((actual - theoretical) / theoretical) * 100;
}

export const StockTakePage = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [selectedStore, setSelectedStore] = useState("크리스탈제이드");
  const [storeOptions, setStoreOptions] = useState<string[]>(["크리스탈제이드"]);
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [history, setHistory] = useState(historyData);
  const [savedBanner, setSavedBanner] = useState(false);

  const filteredItems  = activeCategory === "전체" ? items : items.filter((it) => it.category === activeCategory);
  const inputtedItems  = items.filter((it) => it.actual !== null);
  const normalCount    = inputtedItems.filter((it) => { const r = diffRate(it.theoretical, it.actual); return r !== null && r >= -10 && r <= 5; }).length;
  const shortageCount  = inputtedItems.filter((it) => { const r = diffRate(it.theoretical, it.actual); return r !== null && r < -10; }).length;
  const surplusCount   = inputtedItems.filter((it) => { const r = diffRate(it.theoretical, it.actual); return r !== null && r > 5; }).length;
  const anomalies      = items.filter((it) => { const r = diffRate(it.theoretical, it.actual); return r !== null && r < -8; });

  const handleActualChange = (id: string, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, actual: value === "" ? null : parseFloat(value) } : it)));
  };
  const handleSave = () => { setSavedBanner(true); setTimeout(() => setSavedBanner(false), 3000); };

  useEffect(() => {
    let alive = true;
    getOwnerDashboard()
      .then((dashboard) => {
        if (!alive || !dashboard.store_key) return;
        setStoreOptions([dashboard.store_key]);
        setSelectedStore(dashboard.store_key);
      })
      .catch(() => {
        if (!alive) return;
        setStoreOptions(["크리스탈제이드"]);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getInventoryItems({ store_id: selectedStore }),
      getTheoreticalInventory({ store_id: selectedStore }),
      getInventorySummary({ store_id: selectedStore }),
    ]).then(([inventoryItems, theoreticalRows, summaryRows]) => {
      if (!alive) return;
      if (inventoryItems.length > 0) {
        const theoreticalById = new Map(theoreticalRows.map((row) => [String(row.item_id), Number(row.theoretical_stock ?? 0)]));
        setItems(inventoryItems.slice(0, 20).map((item) => ({
          id: String(item.id),
          name: item.name,
          category: (["육류/어패류", "채소/과일", "양념/소스", "건식품/곡류"].includes(item.category) ? item.category : "양념/소스") as Exclude<Category, "전체">,
          unit: item.unit,
          theoretical: theoreticalById.get(String(item.id)) ?? item.safety_stock,
          actual: theoreticalById.get(String(item.id)) ?? item.safety_stock,
          note: "",
        })));
        setHistory([
          {
            id: `${selectedStore}-${selectedMonth}`,
            month: selectedMonth,
            store: selectedStore,
            totalItems: inventoryItems.length,
            normalCount: summaryRows.filter((row) => !row.is_excess).length,
            shortageCount: summaryRows.filter((row) => row.loss_rate < 0).length,
            surplusCount: summaryRows.filter((row) => row.is_excess).length,
            avgLossRate: Number((summaryRows.reduce((acc, row) => acc + Math.abs(row.loss_rate), 0) / Math.max(summaryRows.length, 1) * 100).toFixed(1)),
            submittedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          },
          ...historyData,
        ]);
      } else {
        // 도도포인트 전용 매장(예: 크리스탈제이드) → 메뉴 라인업 원가 데이터로 fallback
        getMenuCosts(selectedStore).then((menuCosts) => {
          if (!alive || menuCosts.items.length === 0) return;
          setItems(menuCosts.items.map((item) => ({
            id: String(item.id),
            name: item.menu_name,
            category: "양념/소스" as Exclude<Category, "전체">,
            unit: "원",
            theoretical: item.cost_amount ?? Math.round((item.cost_rate ?? 0) * (item.sales_price ?? 0)),
            actual: null,
            note: "",
          })));
        }).catch(() => { /* 메뉴 원가 없으면 초기 데이터 유지 */ });
      }
    }).catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, [selectedMonth, selectedStore]);

  return (
    <div className="space-y-6 pb-10">

      {/* 저장 완료 토스트 */}
      {savedBanner && (
        <div className="fixed right-6 top-[140px] z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-semibold">재고 실사 데이터가 저장되었습니다.</p>
        </div>
      )}

      {/* 페이지 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">재고 관리</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">월말 재고 실사</h2>
            <p className="mt-1 text-sm text-slate-500">이론재고 대비 실재고를 입력하고 손실률을 확인합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-white px-3 py-2">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                {storeOptions.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-white px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9]"
            >
              <Save className="h-4 w-4" />
              실사 저장
            </button>
          </div>
        </div>
      </section>

      {/* KPI 요약 */}
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "전체 품목 수", val: `${items.length}개`, sub: "마스터 기준", icon: ClipboardCheck },
          { label: "정상 품목", val: `${normalCount}개`, sub: "±5% 이내", icon: CheckCircle2 },
          { label: "손실 품목", val: `${shortageCount}개`, sub: "-10% 초과", icon: TrendingDown },
          { label: "과잉 품목", val: `${surplusCount}개`, sub: "+5% 초과", icon: TrendingUp },
        ].map((kpi, idx) => (
          <article key={idx} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{kpi.val}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
          </article>
        ))}
      </section>

      {/* AI 재고 이상 감지 */}
      {anomalies.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500 shadow-sm">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">AI 이상 감지</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">이론재고 대비 임계치(8%) 초과 손실 품목 감지</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {anomalies.map((item) => {
              const rate = diffRate(item.theoretical, item.actual)!;
              return (
                <div key={item.id} className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                      손실 경보
                    </span>
                    <span className="text-sm font-bold text-red-600">{rate.toFixed(1)}%</span>
                  </div>
                  <p className="font-bold text-slate-900 mb-1">{item.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <span>이론 {item.theoretical}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-red-500">실재 {item.actual}</span>
                  </div>
                  <p className="text-xs text-slate-400">발주 검수 오류 또는 관리 소홀로 인한 손실 가능성이 있습니다.</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 재고 실사 입력 테이블 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-700">재고 실사 입력</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* 카테고리 탭 */}
            <div className="flex items-center gap-1 rounded-xl border border-[#DCE4F3] bg-white p-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="h-9 w-44 rounded-xl border border-[#DCE4F3] bg-white pl-8 pr-3 text-sm text-slate-700 focus:border-primary focus:outline-none placeholder:text-slate-300"
                placeholder="품목 검색..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3">품목 정보</th>
                <th className="px-5 py-3 text-right">이론재고</th>
                <th className="px-5 py-3 text-center w-44">실재고 입력</th>
                <th className="px-5 py-3 text-right">차이</th>
                <th className="px-5 py-3 text-center">상태</th>
                <th className="px-5 py-3">비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const rate = diffRate(item.theoretical, item.actual);
                const diff = item.actual !== null ? item.actual - item.theoretical : null;
                const isAnomaly = rate !== null && rate < -8;
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-gray-50/50",
                      isAnomaly && "bg-red-50/30"
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE4F3] bg-white text-[10px] font-medium text-slate-400">
                          {item.id}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.category} · {item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {item.theoretical.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={item.actual ?? ""}
                        onChange={(e) => handleActualChange(item.id, e.target.value)}
                        className="h-9 w-full rounded-xl border border-[#DCE4F3] bg-white px-3 text-right text-sm font-semibold text-slate-900 focus:border-primary focus:outline-none"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {diff !== null ? (
                        <span className={cn("text-sm font-semibold", diff < 0 ? "text-red-500" : diff > 0 ? "text-blue-500" : "text-slate-400")}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {rate !== null ? (
                        <span className={cn(
                          "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                          rate < -10
                            ? "border-red-200 bg-red-50 text-red-500"
                            : rate > 5
                              ? "border-blue-200 bg-blue-50 text-blue-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600"
                        )}>
                          {rate > 0 ? "+" : ""}{rate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300">미입력</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <input
                        className="w-full bg-transparent text-xs text-slate-500 focus:outline-none placeholder:text-slate-200"
                        placeholder="비고 입력..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 실사 이력 */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-700">월별 실사 이력</h3>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">전체 이력 보기</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {history.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm transition-colors hover:border-[#BFD1ED]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-[#DCE4F3] bg-[#F7FAFF]">
                  <p className="text-[9px] font-semibold text-slate-400">{log.month.split("-")[0]}</p>
                  <p className="text-lg font-bold text-primary leading-none">{log.month.split("-")[1]}월</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{log.store}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{log.submittedAt} · {log.totalItems}개 품목</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-500">손실률 {log.avgLossRate}%</p>
                <div className="flex gap-1 justify-end mt-1.5">
                  <div className="h-1.5 w-10 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(log.normalCount / log.totalItems) * 100}%` }} />
                  </div>
                  <div className="h-1.5 w-10 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-red-400 transition-all" style={{ width: `${(log.shortageCount / log.totalItems) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
