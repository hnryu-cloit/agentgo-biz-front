import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart2, Minus, Sparkles, FileText, Download, Loader2, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSvStores, analyzeSupervisorStore, type StoreRiskSummary, type StoreAiAnalysis } from "@/services/supervisor";

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
  
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<StoreAiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let alive = true;
    getSvStores()
      .then((response) => {
        if (!alive) return;
        setStores(response);
        if (response.length > 0) {
          handleStoreSelect(response[0].id);
        }
      })
      .catch(() => {
        if (!alive) return;
        setStores([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleStoreSelect = async (storeId: string) => {
    setSelectedStoreId(storeId);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await analyzeSupervisorStore(storeId);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const kpiOpt = kpiOptions.find((option) => option.value === selectedKpi)!;

  const { ranked, kpiMax, gap, gapPct } = useMemo(() => {
    const sorted = [...stores]
      .sort((a, b) => (b[selectedKpi] as number) - (a[selectedKpi] as number));
    const max = Math.max(...sorted.map((store) => store[selectedKpi] as number), 1);
    const top = sorted[0] ?? null;
    const bottom = sorted[sorted.length - 1] ?? null;
    const computedGap = top && bottom ? (top[selectedKpi] as number) - (bottom[selectedKpi] as number) : 0;
    const computedGapPct = bottom && (bottom[selectedKpi] as number) !== 0 ? Math.round((computedGap / (bottom[selectedKpi] as number)) * 100) : 0;
    return { ranked: sorted, kpiMax: max, gap: computedGap, gapPct: computedGapPct };
  }, [selectedKpi, stores]);

  const selectedStoreName = stores.find(s => s.id === selectedStoreId)?.name || "매장";

  return (
    <div className="space-y-6 pb-10">
      {/* 1. 상단 정보 섹션 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-bold text-primary uppercase tracking-wider">District Analysis</p>
            </div>
            <h2 className="text-2xl font-black text-slate-900">담당 매장 심층 분석</h2>
            <p className="mt-1 text-base font-medium text-slate-500">성과 격차를 분석하고 AI 기반 코칭 포인트를 도출합니다.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1 shadow-sm">
            {(["이번주", "이번달", "전달"] as Period[]).map((option) => (
              <button
                key={option}
                onClick={() => setPeriod(option)}
                className={cn(
                  "rounded-lg px-5 py-2 text-xs font-black transition-all",
                  period === option ? "bg-white text-primary shadow-md" : "text-slate-400 hover:text-slate-600",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 2. 매장 랭킹 목록 (왼쪽) */}
        <section className="lg:col-span-1 rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 h-fit">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">KPI 랭킹</h3>
            </div>
            <select
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value as KpiMetric)}
              className="rounded-lg border border-[#d5deec] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
            >
              {kpiOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {ranked.map((row, idx) => (
              <button 
                key={row.id} 
                onClick={() => handleStoreSelect(row.id)}
                className={cn(
                  "w-full group flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  selectedStoreId === row.id 
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
                  idx === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold truncate", selectedStoreId === row.id ? "text-primary" : "text-slate-700")}>{row.name}</p>
                  <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", idx === 0 ? "bg-primary" : "bg-slate-300")}
                      style={{ width: `${((row[selectedKpi] as number) / kpiMax) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 font-mono">{(row[selectedKpi] as number).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. AI 사전 방문 분석 리포트 (오른쪽) */}
        <section className="lg:col-span-2 space-y-6">
          <article className="rounded-3xl border-2 border-primary/20 bg-white shadow-2xl overflow-hidden min-h-[500px]">
            {/* 리포트 헤더 */}
            <div className="bg-gradient-to-r from-primary to-[#1E5BE9] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Pre-Visit Report</span>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-all">
                    <Download className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-black">{selectedStoreName}</h2>
                  <p className="text-sm font-medium opacity-80 mt-1">방문 전 필수 점검 및 코칭 포인트 리포트</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold opacity-60 uppercase">Analysis Date</p>
                  <p className="text-xs font-black">{aiAnalysis?.generated_at ? new Date(aiAnalysis.generated_at).toLocaleDateString() : "2026-03-17"}</p>
                </div>
              </div>
            </div>

            {/* 리포트 본문 */}
            <div className="p-6 md:p-8">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm font-bold text-slate-500 animate-pulse">실시간 AI 엔진이 데이터를 분석 중입니다...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-8">
                  {/* 이슈 탐지 섹션 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                      <Target className="h-5 w-5 text-red-500" />
                      <h4 className="text-lg font-black text-slate-900">핵심 코칭 포인트</h4>
                    </div>
                    <div className="grid gap-3">
                      {aiAnalysis.ai_coaching_points.map((point, i) => (
                        <div key={i} className="flex items-start gap-4 rounded-2xl bg-red-50 p-4 border border-red-100/50 group hover:shadow-md transition-all">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black italic">
                            {i + 1}
                          </div>
                          <p className="text-sm font-bold text-red-900 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 세부 분석 데이터 */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* 리스크 분석 */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Operational Risk</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-600">취소율 이상 지수</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{aiAnalysis.risk_analysis?.summary?.anomaly_score_max.toFixed(2)} σ</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", aiAnalysis.risk_analysis?.summary?.anomaly_score_max > 1 ? "bg-red-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(aiAnalysis.risk_analysis?.summary?.anomaly_score_max * 50, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          {aiAnalysis.risk_analysis?.ai_insights[0]?.description || "특이사항 없음"}
                        </p>
                      </div>
                    </div>

                    {/* 메뉴 전략 */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Menu Engineering</span>
                      </div>
                      <div className="space-y-3">
                        {aiAnalysis.menu_strategy?.summary && (
                          <div className="flex gap-2 flex-wrap">
                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700 italic">STAR: {aiAnalysis.menu_strategy.summary.star_count}</span>
                            <span className="rounded-lg bg-red-100 px-2 py-1 text-[10px] font-black text-red-700 italic">DOG: {aiAnalysis.menu_strategy.summary.dog_count}</span>
                          </div>
                        )}
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          {aiAnalysis.menu_strategy?.ai_insights[0]?.description || "메뉴 구성 최적화 상태 양호"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 맺음말 */}
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      위 분석 리포트는 최근 7일간의 Raw 데이터를 기반으로 AI 에이전트가 생성하였습니다.<br />
                      현장 방문 시 점주님과 공유하여 실행 액션을 확정하시기 바랍니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm font-bold">분석할 매장을 선택해 주세요.</p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
