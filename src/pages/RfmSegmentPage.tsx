import type React from "react";
import { useEffect, useState } from "react";
import { Users, TrendingDown, Crown, AlertCircle, Filter, Send, CheckCircle2, BarChart3, Target, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { excludeChurnRisk, getChurnRisks, getRfmSegments } from "@/services/marketing";

type SegmentKey = "vip" | "loyal" | "at_risk" | "churned";

const segmentIcons: Record<SegmentKey, React.ReactNode> = {
  vip: <Crown className="h-5 w-5 text-purple-600" />,
  loyal: <Users className="h-5 w-5 text-primary" />,
  at_risk: <AlertCircle className="h-5 w-5 text-amber-600" />,
  churned: <TrendingDown className="h-5 w-5 text-red-500" />,
};

type Segment = {
  key: SegmentKey;
  label: string;
  count: number;
  salesShare: number;
  avgVisit: number;
  color: string;
  borderColor: string;
  description: string;
};

const initialSegments: Segment[] = [
  { key: "vip", label: "VIP 고객", count: 284, salesShare: 38, avgVisit: 8.2, color: "text-purple-700", borderColor: "border-purple-200 bg-purple-50", description: "최근 30일 내 방문 3회↑, 객단가 상위 20% 핵심 수익원" },
  { key: "loyal", label: "우수 고객", count: 841, salesShare: 32, avgVisit: 3.1, color: "text-primary", borderColor: "border-[#b8ccff] bg-[#eef3ff]", description: "꾸준한 방문 패턴을 보이며 브랜드 충성도가 높은 지지층" },
  { key: "at_risk", label: "이탈 우려", count: 312, salesShare: 22, avgVisit: 0.8, color: "text-amber-700", borderColor: "border-amber-200 bg-amber-50", description: "최근 45일 이상 미방문, 경쟁사 이탈 징후가 포착된 위험군" },
  { key: "churned", label: "이탈 고객", count: 198, salesShare: 8, avgVisit: 0, color: "text-red-700", borderColor: "border-red-200 bg-red-50", description: "60일 이상 장기 미방문, 강력한 재활성화 오퍼가 필요한 그룹" },
];

type ChurnCustomer = {
  id: string;
  grade: string;
  daysSince: number;
  riskScore: number;
  predictedLtv: number;
  excluded: boolean;
};

const churnList: ChurnCustomer[] = [
  { id: "C-1042", grade: "VIP", daysSince: 38, riskScore: 94, predictedLtv: 420000, excluded: false },
  { id: "C-2817", grade: "우수", daysSince: 44, riskScore: 87, predictedLtv: 280000, excluded: false },
  { id: "C-0391", grade: "일반", daysSince: 52, riskScore: 81, predictedLtv: 95000, excluded: false },
  { id: "C-1765", grade: "VIP", daysSince: 61, riskScore: 76, predictedLtv: 540000, excluded: false },
];

export const RfmSegmentPage: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [selected, setSelected] = useState<SegmentKey | null>("at_risk");
  const [customers, setCustomers] = useState(churnList);
  const [sentOffer, setSentOffer] = useState(false);

  const activeSegment = segments.find((s) => s.key === selected);
  const toggleExclude = (id: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, excluded: !c.excluded } : c)));
    excludeChurnRisk(id).catch(() => { /* fallback 유지 */ });
  };
  const targetCount = customers.filter((c) => !c.excluded).length;

  useEffect(() => {
    let alive = true;
    getRfmSegments().then((response) => {
      if (!alive || response.length === 0) return;
      const segmentMap: Record<string, SegmentKey> = {
        champions: "vip",
        loyal: "loyal",
        at_risk: "at_risk",
        lost: "churned",
      };
      setSegments(response.map((segment) => {
        const key = segmentMap[segment.segment] ?? "loyal";
        const template = initialSegments.find((item) => item.key === key)!;
        return {
          ...template,
          count: segment.count,
          salesShare: Math.round(segment.revenue_share * 100),
          avgVisit: segment.avg_visit_frequency,
        };
      }));
    }).catch(() => { /* fallback 유지 */ });
    getChurnRisks().then((response) => {
      if (!alive || response.length === 0) return;
      setCustomers(response.slice(0, 20).map((customer) => ({
        id: customer.customer_id,
        grade: customer.segment,
        daysSince: customer.last_visit_date ? Math.max(1, Math.round((Date.now() - new Date(customer.last_visit_date).getTime()) / 86400000)) : 30,
        riskScore: Math.round(customer.churn_probability * 100),
        predictedLtv: 150000,
        excluded: false,
      })));
    }).catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Customer Intelligence</span>
          </div>
          <h1 className="ds-page-title">고객 세그먼트 분석 <span className="text-muted-foreground font-light">|</span> RFM Matrix</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="ds-button ds-button-outline h-11 uppercase font-black tracking-widest text-[10px] italic">
            <Filter className="h-4 w-4 mr-2" /> Segment Filters
          </button>
          <button className="ds-button ds-button-primary h-11 px-6 shadow-xl shadow-primary/20">
            <MousePointer2 className="h-4 w-4 mr-2" /> Generate Target Group
          </button>
        </div>
      </div>

      {/* RFM Matrix Grid */}
      <section className="grid gap-5 md:grid-cols-4">
        {segments.map((seg) => {
          const isActive = selected === seg.key;
          return (
            <article
              key={seg.key}
              onClick={() => setSelected(seg.key)}
              className={cn(
                "ds-kpi-card p-8 cursor-pointer relative overflow-hidden group border-border/50 bg-white",
                isActive ? "border-primary/40 bg-primary/[0.02] shadow-2xl scale-[1.02]" : "hover:border-primary/20"
              )}
            >
              {isActive && <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="h-20 w-20 text-primary" /></div>}
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                  isActive ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-panel-soft text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                )}>
                  {segmentIcons[seg.key]}
                </div>
                {isActive && <span className="live-point" />}
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", isActive ? "text-primary" : "text-muted-foreground")}>{seg.label}</p>
              <p className="text-4xl font-black text-foreground italic leading-none">{seg.count.toLocaleString()}</p>
              
              <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground/60">Sales Share</span>
                  <span className="text-foreground italic">{seg.salesShare}%</span>
                </div>
                <div className="h-1 w-full bg-panel-soft rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", isActive ? "bg-ai-gradient" : "bg-muted-foreground/20")} style={{ width: `${seg.salesShare}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          {/* AI Analysis Panel */}
          {activeSegment && (
            <section className="ds-ai-panel !p-10 border-primary/5">
              <div className="flex items-start gap-8 relative z-10">
                <div className="h-20 w-20 rounded-[2.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 shrink-0 rotate-3 group hover:rotate-0 transition-transform">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <h3 className="ds-section-title text-2xl font-black italic tracking-tighter mb-2">{activeSegment.label} 집중 최적화 가이드</h3>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed mb-8 italic">
                    {activeSegment.description}. 최근 방문 데이터 시뮬레이션 결과, 
                    <span className="text-primary font-black underline decoration-primary/20 decoration-4 underline-offset-4 ml-1">AI Recommendation:</span> 전용 메뉴 15% 리워드 제공 시 24%의 복귀 전환율이 예상됩니다.
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: "Engagement", val: `${activeSegment.avgVisit}회/월`, type: "info" },
                      { label: "Expected Conv.", val: "24.2%", type: "success" },
                      { label: "LTV Protect", val: "₩4.2M", type: "warning" },
                    ].map((m, i) => (
                      <div key={i} className="bg-white/60 p-5 rounded-[2rem] border border-white/40 shadow-sm">
                        <p className="ds-eyebrow !text-[9px] mb-1 opacity-60">{m.label}</p>
                        <p className={cn("text-xl font-black italic", m.type === "success" ? "text-emerald-600" : m.type === "warning" ? "text-amber-600" : "text-foreground")}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Table */}
          <article className="ds-card overflow-hidden">
            <div className="ds-card-header !bg-panel-soft/30">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="ds-section-title">세그먼트 타겟 리스트</h3>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Selection: {targetCount} Nodes active</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="ds-table">
                <thead className="ds-table-thead">
                  <tr>
                    <th className="ds-table-th">Customer ID</th>
                    <th className="ds-table-th text-center">Current Grade</th>
                    <th className="ds-table-th text-center">Recency</th>
                    <th className="ds-table-th">Risk Index</th>
                    <th className="ds-table-th text-right">Predicted LTV</th>
                    <th className="ds-table-th text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {customers.map((c) => (
                    <tr key={c.id} className={cn("ds-table-tr font-bold", c.excluded && "opacity-20 grayscale")}>
                      <td className="ds-table-td font-mono text-primary italic text-xs">#{c.id}</td>
                      <td className="ds-table-td text-center">
                        <span className={cn("ds-badge border-none font-black italic", c.grade === "VIP" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>{c.grade}</span>
                      </td>
                      <td className="ds-table-td text-center italic text-foreground">{c.daysSince}d</td>
                      <td className="ds-table-td">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-panel-soft rounded-full overflow-hidden shadow-inner">
                            <div className={cn("h-full transition-all duration-1000 shadow-sm", c.riskScore > 85 ? "bg-red-500" : "bg-amber-500")} style={{ width: `${c.riskScore}%` }} />
                          </div>
                          <span className="text-[10px] font-black font-mono w-6 italic">{c.riskScore}</span>
                        </div>
                      </td>
                      <td className="ds-table-td text-right font-black font-mono text-foreground italic">₩{(c.predictedLtv/1000).toFixed(0)}k</td>
                      <td className="ds-table-td text-right">
                        <button onClick={() => toggleExclude(c.id)} className={cn("ds-button !h-8 !px-4 !text-[9px] uppercase font-black tracking-widest rounded-lg transition-all", c.excluded ? "bg-muted text-muted-foreground" : "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm")}>{c.excluded ? "Include" : "Exclude"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <article className="ds-card p-10 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20" />
            <h3 className="ds-section-title !text-white text-2xl mb-2 italic">Campaign Execution</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-10 border-b border-white/10 pb-6 italic">Targeted Offer Deployment</p>

            <div className="space-y-8 mb-12">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] relative group hover:bg-white/10 transition-all">
                <p className="ds-eyebrow !text-primary !text-[9px] mb-3">Audience</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black uppercase italic tracking-tighter">{selected}</span>
                  <span className="text-3xl font-black italic">{targetCount} <span className="text-xs font-normal text-slate-500 tracking-normal">Nodes</span></span>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] relative group hover:bg-white/10 transition-all">
                <p className="ds-eyebrow !text-slate-400 !text-[9px] mb-3">Model ROI</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-emerald-400 italic leading-none">3.8x</span>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Impact Index</p>
                </div>
              </div>
            </div>

            {sentOffer ? (
              <div className="w-full h-16 bg-emerald-500 rounded-3xl flex items-center justify-center gap-4 animate-in zoom-in-95 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="h-7 w-7" />
                <span className="font-black uppercase tracking-[0.3em] text-sm italic">Deployed</span>
              </div>
            ) : (
              <button onClick={() => setSentOffer(true)} className="ds-button w-full h-16 bg-ai-gradient border-none !rounded-3xl shadow-[0_0_20px_rgba(47,102,255,0.4)] hover:shadow-[0_0_40px_rgba(47,102,255,0.6)] group">
                <Send className="h-6 w-6 mr-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                <span className="font-black uppercase tracking-[0.3em] text-sm italic">Execute Now</span>
              </button>
            )}
            
            <p className="text-[9px] text-slate-600 text-center mt-8 font-black uppercase tracking-[0.2em] leading-relaxed italic">
              * AI analyzes historical churn logs<br />to optimize conversion latency.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
};
