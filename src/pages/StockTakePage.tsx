import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingDown,
  TrendingUp,
  Bot,
  ChevronRight,
  History,
  Save,
  Search,
  ClipboardCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

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
  { id: "i01", name: "닭고기 (냉동)",    category: "육류/어패류", unit: "kg",       theoretical: 12.5, actual: 11.2, note: "" },
  { id: "i02", name: "돼지고기 (앞다리)", category: "육류/어패류", unit: "kg",       theoretical: 8.0,  actual: 7.8,  note: "" },
  { id: "i03", name: "계란",             category: "육류/어패류", unit: "판(30개)", theoretical: 5,    actual: 4,    note: "" },
  { id: "i04", name: "새우 (냉동)",      category: "육류/어패류", unit: "kg",       theoretical: 3.0,  actual: 3.0,  note: "" },
  { id: "i05", name: "양파",             category: "채소/과일",  unit: "kg",       theoretical: 15.0, actual: 14.5, note: "" },
];

const historyData: HistoryEntry[] = [
  { id: "h1", month: "2026-02", store: "강남역점", totalItems: 18, normalCount: 14, shortageCount: 4, surplusCount: 0, avgLossRate: 3.8, submittedAt: "2026-03-02 10:15" },
  { id: "h2", month: "2026-01", store: "강남역점", totalItems: 18, normalCount: 15, shortageCount: 3, surplusCount: 0, avgLossRate: 2.9, submittedAt: "2026-02-03 09:40" },
];

const CATEGORIES: Category[] = ["전체", "육류/어패류", "채소/과일", "양념/소스", "건식품/곡류"];

function diffRate(theoretical: number, actual: number | null): number | null {
  if (actual === null) return null;
  return ((actual - theoretical) / theoretical) * 100;
}

export const StockTakePage = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [items, setItems] = useState<StockItem[]>(initialItems);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Save Toast */}
      {savedBanner && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md px-6 py-4 shadow-2xl text-emerald-700 animate-in slide-in-from-right-8 duration-300">
          <CheckCircle2 className="h-5 w-5" /> 
          <p className="font-black text-sm uppercase tracking-tight italic">Inventory Data Finalized</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Stock Inventory Audit</span>
          </div>
          <h1 className="ds-page-title">월말 재고 실사 <span className="text-muted-foreground font-light">|</span> 이론 vs 실재고</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <Calendar className="h-4 w-4 text-primary" />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-xs font-black focus:outline-none" />
          </div>
          <button onClick={handleSave} className="ds-button ds-button-primary h-11 px-6 shadow-2xl shadow-primary/20">
            <Save className="h-4 w-4 mr-2" /> Commit Audit
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <section className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Total Items", val: `${items.length}`, delta: "Master", type: "info", icon: ClipboardCheck },
          { label: "Audit Success", val: `${normalCount}`, delta: "Within ±5%", type: "success", icon: CheckCircle2 },
          { label: "Critical Loss", val: `${shortageCount}`, delta: "-10% Under", type: "danger", icon: TrendingDown },
          { label: "Excess Stock", val: `${surplusCount}`, delta: "+5% Over", type: "warning", icon: TrendingUp },
        ].map((kpi, idx) => (
          <article key={idx} className="ds-kpi-card bg-white">
            <div className="flex items-center justify-between">
              <p className="ds-kpi-label">{kpi.label}</p>
              <span className={cn(
                "ds-badge shadow-none border-none font-black italic",
                kpi.type === "danger" ? "bg-red-100 text-red-600" : kpi.type === "warning" ? "bg-amber-100 text-amber-600" : kpi.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
              )}>{kpi.delta}</span>
            </div>
            <p className="ds-kpi-value leading-none">{kpi.val}</p>
            <div className="h-10 w-10 rounded-xl bg-panel-soft flex items-center justify-center text-primary mt-2">
              <kpi.icon className="h-5 w-5" />
            </div>
          </article>
        ))}
      </section>

      {/* AI Anomalies */}
      {anomalies.length > 0 && (
        <section className="ds-ai-panel !bg-red-50/30 border-red-500/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-xl shadow-red-500/30">
              <AlertCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="ds-section-title text-xl !text-red-600">AI 재고 이상 감지 경보</h2>
              <p className="text-sm text-red-600/60 font-medium italic">이론재고 대비 임계치(8%) 초과 손실 품목 감지</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {anomalies.map((item) => {
              const rate = diffRate(item.theoretical, item.actual)!;
              return (
                <div key={item.id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-red-200 p-6 shadow-sm group hover:border-red-400 transition-all">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-50">
                    <span className="ds-badge bg-red-500 text-white border-none italic">Critical Loss</span>
                    <span className="text-xl font-black text-red-600 italic">{rate.toFixed(1)}%</span>
                  </div>
                  <h4 className="font-black text-foreground text-lg mb-2 italic underline decoration-red-100 decoration-4 underline-offset-4">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                    <span>Theoretical {item.theoretical}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-red-600">Actual {item.actual}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">발주 검수 오류 또는 관리 소홀로 인한 대량 손실 가능성이 매우 높습니다.</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Audit Table */}
      <section className="ds-card overflow-hidden">
        <div className="ds-card-header !bg-panel-soft/30">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="ds-section-title">재고 실사 입력 테이블</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-muted p-1 rounded-xl shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                    activeCategory === cat ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input className="ds-input pl-9 h-9 text-[10px] w-48 bg-white border-border/50 uppercase tracking-widest" placeholder="Search Master..." />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="ds-table">
            <thead className="ds-table-thead">
              <tr>
                <th className="ds-table-th">Master Info</th>
                <th className="ds-table-th text-right">Theoretical</th>
                <th className="ds-table-th text-center w-44">Actual Input</th>
                <th className="ds-table-th text-right italic">Variance</th>
                <th className="ds-table-th text-center">Status</th>
                <th className="ds-table-th">Operator Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredItems.map((item) => {
                const rate = diffRate(item.theoretical, item.actual);
                const diff = item.actual !== null ? item.actual - item.theoretical : null;
                const isAnomaly = rate !== null && rate < -8;
                return (
                  <tr key={item.id} className={cn("ds-table-tr", isAnomaly && "bg-red-50/20 hover:bg-red-50/30")}>
                    <td className="ds-table-td">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-panel-soft flex items-center justify-center font-black text-muted-foreground text-[9px] uppercase tracking-tighter italic border border-border/50">{item.id}</div>
                        <div>
                          <p className="font-black text-foreground italic">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 italic opacity-60">{item.category} · {item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="ds-table-td text-right font-mono font-black text-foreground italic">
                      {item.theoretical.toLocaleString()}
                    </td>
                    <td className="ds-table-td">
                      <input 
                        type="number" 
                        step="0.1" 
                        value={item.actual ?? ""}
                        onChange={(e) => handleActualChange(item.id, e.target.value)}
                        className="ds-input w-full h-10 text-right font-black font-mono !bg-white border-primary/10 shadow-inner italic"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="ds-table-td text-right">
                      {diff !== null ? (
                        <div className={cn("font-black text-xs italic tracking-tighter", diff < 0 ? "text-red-500" : diff > 0 ? "text-blue-500" : "text-muted-foreground/40")}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}<span className="ml-1 opacity-40">{item.unit}</span>
                        </div>
                      ) : <span className="text-muted-foreground/20">—</span>}
                    </td>
                    <td className="ds-table-td text-center">
                      {rate !== null ? (
                        <span className={cn(
                          "ds-badge shadow-sm font-mono italic",
                          rate < -10 ? "ds-badge-danger" : rate > 5 ? "ds-badge-info" : "ds-badge-success"
                        )}>{rate > 0 ? "+" : ""}{rate.toFixed(1)}%</span>
                      ) : <span className="text-muted-foreground/20 italic text-[10px]">Pending</span>}
                    </td>
                    <td className="ds-table-td">
                      <input className="bg-transparent border-none text-[11px] font-bold w-full focus:ring-0 placeholder:text-muted-foreground/20 placeholder:italic" placeholder="Record reason for audit variance..." />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* History Grid */}
      <section className="ds-card p-8 bg-white border-primary/5">
        <div className="flex items-center justify-between mb-10 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-panel-soft text-primary flex items-center justify-center">
              <History className="h-6 w-6" />
            </div>
            <h3 className="ds-section-title text-xl">Monthly Audit History</h3>
          </div>
          <button className="ds-button ds-button-ghost !text-[10px] uppercase font-black tracking-widest italic underline underline-offset-4 decoration-primary/20">Full Archive Report →</button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {historyData.map((log) => (
            <div key={log.id} className="p-6 ds-glass rounded-3xl border-border/40 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white border border-border shadow-inner flex flex-col items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                  <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">{log.month.split('-')[0]}</p>
                  <p className="text-lg font-black text-primary leading-none mt-1 italic tracking-tighter">{log.month.split('-')[1]}</p>
                </div>
                <div>
                  <p className="text-sm font-black text-foreground italic uppercase">Audit Integrity Sync</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 italic">{log.submittedAt} · {log.totalItems} Nodes verified</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-red-500 italic uppercase leading-none tracking-tighter">Loss Index: {log.avgLossRate}%</p>
                <div className="flex gap-1 justify-end mt-2">
                  <div className="h-1 w-10 rounded-full bg-panel-soft overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ width: `${(log.normalCount/log.totalItems)*100}%` }} /></div>
                  <div className="h-1 w-10 rounded-full bg-panel-soft overflow-hidden"><div className="h-full bg-red-500 transition-all duration-1000 shadow-[0_0_5px_rgba(239,68,68,0.5)]" style={{ width: `${(log.shortageCount/log.totalItems)*100}%` }} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
