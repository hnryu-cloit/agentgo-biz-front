import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingDown,
  TrendingUp,
  Bot,
  ChevronDown,
  History,
  Save,
} from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

// ─── 타입 ──────────────────────────────────────────────────────────────────
type Category = "전체" | "육류/어패류" | "채소/과일" | "양념/소스" | "건식품/곡류";

type StockItem = {
  id: string;
  name: string;
  category: Exclude<Category, "전체">;
  unit: string;
  theoretical: number; // 이론재고
  actual: number | null; // 실재고 (입력값)
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

// ─── 목업 데이터 ───────────────────────────────────────────────────────────
const initialItems: StockItem[] = [
  // 육류/어패류
  { id: "i01", name: "닭고기 (냉동)", category: "육류/어패류", unit: "kg", theoretical: 12.5, actual: 11.2, note: "" },
  { id: "i02", name: "돼지고기 (앞다리)", category: "육류/어패류", unit: "kg", theoretical: 8.0, actual: 7.8, note: "" },
  { id: "i03", name: "계란", category: "육류/어패류", unit: "판(30개)", theoretical: 5, actual: 4, note: "" },
  { id: "i04", name: "새우 (냉동)", category: "육류/어패류", unit: "kg", theoretical: 3.0, actual: 3.0, note: "" },
  // 채소/과일
  { id: "i05", name: "양파", category: "채소/과일", unit: "kg", theoretical: 15.0, actual: 14.5, note: "" },
  { id: "i06", name: "마늘 (다진)", category: "채소/과일", unit: "kg", theoretical: 3.0, actual: 3.2, note: "" },
  { id: "i07", name: "파 (대파)", category: "채소/과일", unit: "단", theoretical: 10, actual: 8, note: "" },
  { id: "i08", name: "감자", category: "채소/과일", unit: "kg", theoretical: 20.0, actual: 18.5, note: "" },
  { id: "i09", name: "버섯 (표고)", category: "채소/과일", unit: "kg", theoretical: 4.0, actual: 4.1, note: "" },
  // 양념/소스
  { id: "i10", name: "간장", category: "양념/소스", unit: "L", theoretical: 8.0, actual: 7.5, note: "" },
  { id: "i11", name: "된장", category: "양념/소스", unit: "kg", theoretical: 5.0, actual: 5.0, note: "" },
  { id: "i12", name: "고추장", category: "양념/소스", unit: "kg", theoretical: 3.0, actual: 2.8, note: "" },
  { id: "i13", name: "식용유", category: "양념/소스", unit: "L", theoretical: 10.0, actual: 9.2, note: "" },
  { id: "i14", name: "참기름", category: "양념/소스", unit: "L", theoretical: 2.0, actual: 1.8, note: "" },
  // 건식품/곡류
  { id: "i15", name: "쌀", category: "건식품/곡류", unit: "kg", theoretical: 50.0, actual: 47.0, note: "" },
  { id: "i16", name: "밀가루", category: "건식품/곡류", unit: "kg", theoretical: 10.0, actual: 10.5, note: "" },
  { id: "i17", name: "당면", category: "건식품/곡류", unit: "kg", theoretical: 5.0, actual: 4.8, note: "" },
  { id: "i18", name: "두부", category: "건식품/곡류", unit: "모", theoretical: 12, actual: 11, note: "" },
];

const historyData: HistoryEntry[] = [
  { id: "h1", month: "2026-02", store: "강남역점", totalItems: 18, normalCount: 14, shortageCount: 4, surplusCount: 0, avgLossRate: 3.8, submittedAt: "2026-03-02 10:15" },
  { id: "h2", month: "2026-01", store: "강남역점", totalItems: 18, normalCount: 15, shortageCount: 3, surplusCount: 0, avgLossRate: 2.9, submittedAt: "2026-02-03 09:40" },
  { id: "h3", month: "2025-12", store: "강남역점", totalItems: 18, normalCount: 12, shortageCount: 5, surplusCount: 1, avgLossRate: 5.1, submittedAt: "2026-01-02 11:05" },
  { id: "h4", month: "2025-11", store: "강남역점", totalItems: 18, normalCount: 16, shortageCount: 2, surplusCount: 0, avgLossRate: 2.2, submittedAt: "2025-12-03 10:30" },
];

const CATEGORIES: Category[] = ["전체", "육류/어패류", "채소/과일", "양념/소스", "건식품/곡류"];

// ─── 유틸 ──────────────────────────────────────────────────────────────────
function diffRate(theoretical: number, actual: number | null): number | null {
  if (actual === null) return null;
  return ((actual - theoretical) / theoretical) * 100;
}

function statusOf(rate: number | null): "정상" | "과잉" | "부족" | "미입력" {
  if (rate === null) return "미입력";
  if (rate > 5) return "과잉";
  if (rate < -10) return "부족";
  return "정상";
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
export const StockTakePage = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [selectedStore, setSelectedStore] = useState("강남역점");
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [savedBanner, setSavedBanner] = useState(false);

  const filteredItems =
    activeCategory === "전체"
      ? items
      : items.filter((it) => it.category === activeCategory);

  // KPI 집계
  const inputtedItems = items.filter((it) => it.actual !== null);
  const normalCount = inputtedItems.filter((it) => {
    const r = diffRate(it.theoretical, it.actual);
    return r !== null && r >= -10 && r <= 5;
  }).length;
  const shortageCount = inputtedItems.filter((it) => {
    const r = diffRate(it.theoretical, it.actual);
    return r !== null && r < -10;
  }).length;
  const surplusCount = inputtedItems.filter((it) => {
    const r = diffRate(it.theoretical, it.actual);
    return r !== null && r > 5;
  }).length;

  // AI 이상 품목
  const anomalies = items.filter((it) => {
    const r = diffRate(it.theoretical, it.actual);
    return r !== null && r < -8;
  });

  const handleActualChange = (id: string, value: string) => {
    const num = value === "" ? null : parseFloat(value);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, actual: num } : it)));
  };

  const handleNoteChange = (id: string, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, note: value } : it)));
  };

  const handleSave = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const kpiCards = [
    {
      label: "총 품목",
      value: items.length,
      unit: "개",
      icon: <Package className="h-5 w-5" />,
      color: "text-[#4a5568]",
      bg: "bg-[var(--panel-soft)]",
      border: "border-[var(--border)]",
    },
    {
      label: "정상",
      value: normalCount,
      unit: "개",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "부족 (손실 의심)",
      value: shortageCount,
      unit: "개",
      icon: <TrendingDown className="h-5 w-5" />,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      label: "과잉 (입고 오류 의심)",
      value: surplusCount,
      unit: "개",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── 저장 완료 배너 ── */}
      {savedBanner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          재고 실사 데이터가 저장되었습니다.
        </div>
      )}

      {/* ── 헤더 ── */}
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">월말 재고 실사</h2>
            <p className="mt-1 text-base text-muted-foreground">
              식자재 이론재고와 실재고를 비교하고 손실·과잉을 기록합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* 매장 선택 */}
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-semibold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            >
              {storeNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {/* 월 선택 */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-semibold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            />
            {/* 저장 */}
            <button
              onClick={handleSave}
              className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </section>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "rounded-2xl border p-5 shadow-elevated",
              card.border,
              card.bg
            )}
          >
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-xl border", card.border, "bg-card", card.color)}>
              {card.icon}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">{card.label}</p>
            <p className={cn("mt-1 text-3xl font-black", card.color)}>
              {card.value}
              <span className="ml-1 text-base font-bold">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── AI 이상 감지 ── */}
      {anomalies.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-elevated">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
              <Bot className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-bold text-amber-800">AI 재고 이상 감지</span>
            <span className="ml-auto rounded-full border border-amber-200 bg-card px-2 py-0.5 text-[10px] font-black text-amber-600">
              {anomalies.length}건 주의
            </span>
          </div>
          <div className="space-y-3">
            {anomalies.map((item) => {
              const rate = diffRate(item.theoretical, item.actual)!;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-card px-4 py-3 shadow-sm md:flex-row md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="font-bold text-[#1a2138]">{item.name}</span>
                    <span className="text-xs text-[var(--subtle-foreground)]">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs ml-6 md:ml-auto">
                    <span className="text-muted-foreground">
                      이론 <span className="font-mono font-bold text-[#34415b]">{item.theoretical}{item.unit}</span>
                      {" → "}
                      실재고 <span className="font-mono font-bold text-red-600">{item.actual}{item.unit}</span>
                    </span>
                    <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 font-mono font-black text-red-600">
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="ml-6 text-xs text-amber-700 md:ml-0">
                    {rate < -15
                      ? "손실율 15% 초과 — 냉장 보관 상태 점검 또는 폐기 기록 확인을 권고합니다."
                      : "손실율 임계값(8%) 초과 — 납품 검수 기준 강화 또는 사용량 재확인이 필요합니다."}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 실사 입력 테이블 ── */}
      <section className="app-card overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] bg-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-bold text-foreground">실재고 입력</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm",
                    activeCategory === cat
                      ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                      : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-40">카테고리</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">품목명</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-20">단위</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-28">이론재고</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-32">실재고 입력</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-28">차이</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">차이율</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">상태</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider w-44">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => {
                const actual = item.actual;
                const rate = diffRate(item.theoretical, actual);
                const diff = actual !== null ? actual - item.theoretical : null;
                const status = statusOf(rate);

                return (
                  <tr key={item.id} className="group transition-all hover:bg-[var(--surface-hover)]/70 font-medium">
                    {/* 카테고리 */}
                    <td className="pl-8 pr-4 py-3 border-r border-[var(--border)]/40">
                      <span className="text-xs font-semibold text-[var(--subtle-foreground)]">{item.category}</span>
                    </td>
                    {/* 품목명 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 font-bold text-[#1a2138]">
                      {item.name}
                    </td>
                    {/* 단위 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-center text-xs text-muted-foreground">
                      {item.unit}
                    </td>
                    {/* 이론재고 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-right font-mono text-[#34415b]">
                      {item.theoretical.toLocaleString()}
                    </td>
                    {/* 실재고 입력 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={actual ?? ""}
                        onChange={(e) => handleActualChange(item.id, e.target.value)}
                        placeholder="입력"
                        className={cn(
                          "h-8 w-full rounded-lg border px-2 text-right font-mono text-sm shadow-sm outline-none transition-colors",
                          actual === null
                            ? "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] focus:border-primary/50 focus:bg-card"
                            : "border-[#c9d8ff] bg-[#f4f7ff] text-[#1a2138] focus:border-primary/50"
                        )}
                      />
                    </td>
                    {/* 차이 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-right font-mono">
                      {diff !== null ? (
                        <span className={cn(
                          "font-bold",
                          diff > 0 ? "text-blue-600" : diff < 0 ? "text-red-600" : "text-[var(--subtle-foreground)]"
                        )}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-[#b0bdd4]">—</span>
                      )}
                    </td>
                    {/* 차이율 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-center">
                      {rate !== null ? (
                        <span className={cn(
                          "font-mono text-xs font-black",
                          rate > 5 ? "text-blue-600" : rate < -10 ? "text-red-600" : rate < -5 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {rate > 0 ? "+" : ""}{rate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[#b0bdd4]">—</span>
                      )}
                    </td>
                    {/* 상태 */}
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-center">
                      {status === "미입력" ? (
                        <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-0.5 text-[10px] font-black text-[var(--subtle-foreground)]">
                          미입력
                        </span>
                      ) : status === "정상" ? (
                        <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-600">
                          정상
                        </span>
                      ) : status === "부족" ? (
                        <span className="inline-block rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600">
                          부족
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-600">
                          과잉
                        </span>
                      )}
                    </td>
                    {/* 비고 */}
                    <td className="pl-4 pr-8 py-3">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        placeholder="특이사항 입력"
                        className="h-8 w-full rounded-lg border border-[var(--border)] bg-card px-2 text-xs text-[#4a5568] shadow-sm outline-none focus:border-primary/50 placeholder:text-[#b0bdd4]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 하단 안내 */}
        <div className="px-8 py-4 bg-[var(--panel-soft)] border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">
            {filteredItems.length}개 품목 · 차이율 ±5% 이내 정상 / -10% 미만 부족
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Save className="h-3.5 w-3.5" />
            저장하기
          </button>
        </div>
      </section>

      {/* ── 실사 이력 ── */}
      <section className="app-card overflow-hidden">
        <div className="app-section-header">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--subtle-foreground)]" />
            <h3 className="text-lg font-bold text-foreground">실사 이력</h3>
          </div>
          <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">Recent 6 Months</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-32">실사 월</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-32">매장</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">총 품목</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-20">정상</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">부족</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">과잉</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-28">평균 손실율</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider w-44">제출 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyData.map((row) => (
                <tr key={row.id} className="group transition-all hover:bg-[var(--surface-hover)]/70 font-medium cursor-pointer">
                  <td className="pl-8 pr-4 py-4 border-r border-[var(--border)]/40 font-mono font-bold text-[#1a2138]">
                    {row.month}
                  </td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-[#4a5568]">{row.store}</td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center text-[#4a5568]">{row.totalItems}</td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center font-bold text-emerald-600">{row.normalCount}</td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center font-bold text-red-600">
                    {row.shortageCount > 0 ? row.shortageCount : <span className="text-[#b0bdd4]">—</span>}
                  </td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center font-bold text-blue-600">
                    {row.surplusCount > 0 ? row.surplusCount : <span className="text-[#b0bdd4]">—</span>}
                  </td>
                  <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center">
                    <span className={cn(
                      "font-mono text-xs font-black",
                      row.avgLossRate > 4 ? "text-red-600" : row.avgLossRate > 2 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      -{row.avgLossRate}%
                    </span>
                  </td>
                  <td className="pl-4 pr-8 py-4 text-[var(--subtle-foreground)] text-xs font-mono">
                    <div className="flex items-center justify-between">
                      {row.submittedAt}
                      <ChevronDown className="h-4 w-4 text-[#b0bdd4] group-hover:text-[var(--subtle-foreground)] rotate-[-90deg]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-8 py-4 bg-card border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Page 1 of 2</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all disabled:opacity-30 shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)] transition-all">2</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] transition-all shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};