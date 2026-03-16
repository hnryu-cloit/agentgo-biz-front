import type React from "react";
import { useMemo, useState } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Megaphone, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckSquare, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  TrendingDown,
  FileText,
  ExternalLink,
  Target
} from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

type StoreRow = {
  id: string;
  name: string;
  salesDelta: number;
  risk: number;
  churn: "높음" | "보통" | "낮음";
  margin: "위험" | "주의" | "정상";
  compliance: number;
  lastVisit: string;
  topIssue: string;
};

const rows: StoreRow[] = [
  { id: "s1", name: storeResources[0]?.name ?? "A매장", salesDelta: -18, risk: 92, churn: "높음", margin: "위험", compliance: 40, lastVisit: "82일 전", topIssue: "취소율 급증 (+180%)" },
  { id: "s2", name: storeResources[1]?.name ?? "B매장", salesDelta: -11, risk: 78, churn: "높음", margin: "주의", compliance: 60, lastVisit: "45일 전", topIssue: "이탈 고객 임계치 초과" },
  { id: "s3", name: storeResources[2]?.name ?? "C매장", salesDelta: -8, risk: 71, churn: "보통", margin: "위험", compliance: 80, lastVisit: "21일 전", topIssue: "메뉴B 마진 역전" },
  { id: "s4", name: storeResources[3]?.name ?? "D매장", salesDelta: 5, risk: 42, churn: "보통", margin: "주의", compliance: 90, lastVisit: "14일 전", topIssue: "피크타임 지연" },
  { id: "s5", name: storeResources[4]?.name ?? "E매장", salesDelta: 3, risk: 18, churn: "낮음", margin: "정상", compliance: 100, lastVisit: "7일 전", topIssue: "정상 운영 중" },
];

type KpiMetric = "sales" | "unitPrice" | "qty" | "margin" | "cancel";
const kpiOptions: { value: KpiMetric; label: string; unit: string }[] = [
  { value: "sales", label: "매출", unit: "천원" },
  { value: "unitPrice", label: "객단가", unit: "원" },
  { value: "qty", label: "객수", unit: "명" },
  { value: "margin", label: "마진율", unit: "%" },
  { value: "cancel", label: "취소율", unit: "%" },
];

const kpiValues: Record<KpiMetric, number[]> = {
  sales: [870, 1240, 980, 1560, 1820],
  unitPrice: [7016, 8200, 7500, 9100, 10200],
  qty: [124, 151, 131, 172, 178],
  margin: [18.1, 22.4, 20.1, 25.3, 27.8],
  cancel: [4.2, 3.1, 2.8, 1.9, 1.2],
};

const complianceData = [
  { store: "A매장", done: 2, total: 5 },
  { store: "B매장", done: 3, total: 5 },
  { store: "C매장", done: 4, total: 5 },
  { store: "D매장", done: 4, total: 5 },
  { store: "E매장", done: 5, total: 5 },
];

export const SupervisorDashboardPage: React.FC = () => {
  const [reportId, setReportId] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric>("sales");
  const report = useMemo(() => rows.find((row) => row.id === reportId) ?? null, [reportId]);

  const stats = useMemo(() => ({
    danger: rows.filter((r) => r.risk >= 80).length,
    warning: rows.filter((r) => r.risk >= 50 && r.risk < 80).length,
    normal: rows.filter((r) => r.risk < 50).length,
  }), []);

  const kpiOpt = kpiOptions.find((o) => o.value === selectedKpi)!;
  const kpiMax = Math.max(...kpiValues[selectedKpi]);
  const rankedRows = [...rows]
    .map((r, i) => ({ ...r, kpiVal: kpiValues[selectedKpi][i] }))
    .sort((a, b) => b.kpiVal - a.kpiVal);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">District Operations</span>
          </div>
          <h1 className="ds-page-title">서울 남부구역 <span className="text-muted-foreground font-light">|</span> SV 보드</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="ds-input pl-10 w-64" placeholder="매장명 또는 이슈 검색..." />
          </div>
          <button className="ds-button ds-button-primary h-11">
            <Calendar className="h-4 w-4 mr-2" />
            방문 일정 최적화
          </button>
        </div>
      </div>

      {/* Zone Briefing */}
      <section className="ds-ai-panel">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="ds-section-title text-xl">구역 실시간 분석</h2>
            <p className="text-sm text-muted-foreground font-medium">15개 가맹점 대상 · 2026-03-15 07:00</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-sm">
            <p className="ds-eyebrow !text-[10px] mb-2">구역 매출 증감</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-red-500">-5.8%</p>
              <TrendingDown className="h-6 w-6 text-red-500 mb-1" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-medium">하락 매장 3곳 집중 분석이 필요합니다.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-sm">
            <p className="ds-eyebrow !text-[10px] mb-2">핵심 리스크 감지</p>
            <p className="text-xl font-black text-foreground">A매장 이상 결제 경보</p>
            <span className="ds-badge ds-badge-danger mt-3">P0 Critical</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-sm">
            <p className="ds-eyebrow !text-[10px] mb-2">AI 방문 추천</p>
            <p className="text-xl font-black text-primary italic underline">A매장, B매장</p>
            <p className="mt-3 text-xs text-muted-foreground font-medium">리스크 스코어가 70점을 초과했습니다.</p>
          </div>
        </div>
      </section>

      {/* District KPI Summary */}
      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "위험 매장", val: stats.danger, sub: "즉시 개입 필요", type: "danger", icon: ShieldAlert },
          { label: "주의 매장", val: stats.warning, sub: "모니터링 강화", type: "warning", icon: Activity },
          { label: "정상 매장", val: stats.normal, sub: "운영 안정권", type: "success", icon: CheckSquare },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <article key={idx} className="ds-kpi-card !flex-row items-center gap-6">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                item.type === "danger" ? "bg-red-50 text-red-500" : item.type === "warning" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
              )}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="ds-kpi-label">{item.label}</p>
                <p className="ds-kpi-value leading-none mt-1">{item.val}개</p>
                <p className="text-[11px] font-bold text-subtle-foreground mt-2 uppercase">{item.sub}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Risk Ranking Table */}
        <section className="lg:col-span-8 ds-card overflow-hidden">
          <div className="ds-card-header">
            <div className="flex items-center gap-3">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h3 className="ds-section-title">매장별 리스크 랭킹</h3>
            </div>
            <button className="ds-button ds-button-outline !h-9 !px-4 !text-xs uppercase tracking-widest">
              <Filter className="h-3.5 w-3.5 mr-2" /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead className="ds-table-thead">
                <tr>
                  <th className="ds-table-th">매장 정보</th>
                  <th className="ds-table-th text-right">매출 증감</th>
                  <th className="ds-table-th text-center">리스크</th>
                  <th className="ds-table-th">주요 이슈</th>
                  <th className="ds-table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.map((row) => (
                  <tr key={row.id} className="ds-table-tr group">
                    <td className="ds-table-td">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          row.risk >= 80 ? "bg-red-500" : row.risk >= 50 ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                        <div>
                          <p className="font-black text-foreground">{row.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">Last Visit: {row.lastVisit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="ds-table-td text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 font-black text-sm italic",
                        row.salesDelta < 0 ? "text-red-500" : "text-emerald-600"
                      )}>
                        {row.salesDelta < 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        {Math.abs(row.salesDelta)}%
                      </div>
                    </td>
                    <td className="ds-table-td text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center h-8 w-12 rounded-lg font-black text-xs italic",
                        row.risk >= 80 ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : row.risk >= 50 ? "bg-amber-500 text-white" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {row.risk}
                      </span>
                    </td>
                    <td className="ds-table-td">
                      <p className="text-xs font-bold text-foreground max-w-[160px] truncate">{row.topIssue}</p>
                    </td>
                    <td className="ds-table-td text-right">
                      <button 
                        onClick={() => setReportId(row.id)}
                        className="ds-button ds-button-ghost !h-9 !w-9 !p-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-primary"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <article className="ds-card p-6">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
              <h3 className="ds-section-title text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> 매장 간 지표 비교
              </h3>
              <select
                value={selectedKpi}
                onChange={(e) => setSelectedKpi(e.target.value as KpiMetric)}
                className="bg-panel-soft border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase focus:ring-0"
              >
                {kpiOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-6">
              {rankedRows.map((row, idx) => (
                <div key={row.id}>
                  <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-tighter">
                    <span className="text-foreground">{idx+1}. {row.name}</span>
                    <span className="text-primary italic">{row.kpiVal.toLocaleString()}{kpiOpt.unit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-panel-soft rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ai-gradient rounded-full transition-all duration-1000" 
                      style={{ width: `${(row.kpiVal/kpiMax)*100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="ds-card p-6 border-primary/5">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
              <h3 className="ds-section-title text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> 공지 이행 현황
              </h3>
            </div>
            <div className="space-y-6">
              {complianceData.map((item) => (
                <div key={item.store} className="flex items-center gap-4">
                  <span className="w-14 text-[11px] font-black text-foreground uppercase truncate">{item.store}</span>
                  <div className="flex-1 h-1 bg-panel-soft rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 shadow-sm",
                        item.done === item.total ? "bg-emerald-500" : "bg-primary"
                      )} 
                      style={{ width: `${(item.done/item.total)*100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/60 w-10 text-right italic">{item.done}/{item.total}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      {/* AI Visit Report Modal */}
      {report && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl ds-glass p-8 rounded-3xl border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="ds-section-title text-2xl font-black italic">{report.name} 분석 리포트</h4>
                  <p className="ds-eyebrow !text-muted-foreground/60 mt-1">Generated by AgentGo Intelligence</p>
                </div>
              </div>
              <button onClick={() => setReportId(null)} className="ds-button ds-button-ghost !h-10 !w-10 !p-0 rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>

            <div className="space-y-4 mb-10">
              {[
                { label: "Critical Issues", value: "매출 하락 -18% (객수 감소 주도), 이탈 징후 임계치 초과", icon: AlertCircle, color: "text-red-500" },
                { label: "Coaching Guide", value: "피크타임 전후 프로모션 수동 실행 권장, 등급별 쿠폰 발송 점검", icon: Target, color: "text-primary" },
                { label: "Key Conversation", value: "매출 하락 원인 점주 의견 청취, 공지 미이행 사유 파악 및 지원", icon: Megaphone, color: "text-amber-500" },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 p-6 bg-white/50 rounded-2xl border border-border/50 shadow-sm group hover:border-primary/20 transition-all">
                  <div className={cn("h-12 w-12 rounded-2xl bg-panel-soft flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", item.color)}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="ds-eyebrow !text-[10px] mb-1.5">{item.label}</p>
                    <p className="text-sm text-foreground font-bold leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="ds-button ds-button-primary bg-ai-gradient border-none h-14 uppercase tracking-widest font-black shadow-2xl shadow-primary/30">
                <ExternalLink className="h-4 w-4 mr-2" /> Start Visit Log
              </button>
              <button className="ds-button ds-button-outline h-14 uppercase tracking-widest font-black">Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
