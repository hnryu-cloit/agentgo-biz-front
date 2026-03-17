import type React from "react";
import { useEffect, useState, useMemo } from "react";
import {
  Users,
  TrendingDown,
  Crown,
  AlertCircle,
  Send,
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  excludeChurnRisk,
  getChurnRisks,
  getRfmSegments,
  type ChurnRiskCustomer,
} from "@/services/marketing";

type SegmentKey = "vip" | "loyal" | "at_risk" | "churned";

const segmentMeta: Record<SegmentKey, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string; desc: string }> = {
  vip: {
    label: "VIP 고객",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
    desc: "최근 30일 내 고빈도·고단가 방문 핵심 고객군",
  },
  loyal: {
    label: "우수 고객",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-[#eef3ff]",
    borderColor: "border-[#d5deec]",
    desc: "꾸준한 방문 패턴을 보이며 브랜드 충성도가 높은 지지층",
  },
  at_risk: {
    label: "이탈 우려",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    desc: "최근 45일 이상 미방문, 경쟁사 이탈 징후 포착",
  },
  churned: {
    label: "이탈 고객",
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    desc: "60일 이상 장기 미방문, 강력한 재활성화 오퍼 필요",
  },
};

type DisplaySegment = {
  key: SegmentKey;
  count: number;
  revenueShare: number;
  avgFrequency: number;
};

export const RfmSegmentPage: React.FC = () => {
  const [segments, setSegments] = useState<DisplaySegment[]>([]);
  const [selected, setSelected] = useState<SegmentKey>("at_risk");
  const [customers, setCustomers] = useState<(ChurnRiskCustomer & { excluded: boolean })[]>([]);
  const [sentOffer, setSentOffer] = useState(false);

  useEffect(() => {
    let alive = true;

    const segmentMap: Record<string, SegmentKey> = {
      champions: "vip",
      loyal: "loyal",
      at_risk: "at_risk",
      lost: "churned",
    };

    Promise.all([getRfmSegments(), getChurnRisks()])
      .then(([segData, churnData]) => {
        if (!alive) return;
        
        const mappedSegs = segData.map((s) => ({
          key: segmentMap[s.segment] || "loyal",
          count: s.count,
          revenueShare: Math.round(s.revenue_share * 100),
          avgFrequency: s.avg_visit_frequency,
        }));
        
        setSegments(mappedSegs);
        setCustomers(churnData.map(c => ({ ...c, excluded: false })));
      })
      .catch(console.error)
      .finally(() => undefined);

    return () => { alive = false; };
  }, []);

  const activeSegment = useMemo(() => 
    segments.find(s => s.key === selected) || null
  , [segments, selected]);

  const toggleExclude = (id: string) => {
    setCustomers(prev => prev.map(c => c.customer_id === id ? { ...c, excluded: !c.excluded } : c));
    excludeChurnRisk(id).catch(() => {});
  };

  const targetCount = customers.filter(c => !c.excluded).length;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* 헤더 섹션 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Customer Intelligence</p>
              <h1 className="text-xl font-bold text-foreground">고객 세그먼트 분석 (RFM)</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">AI가 최근 결제 데이터를 분석하여 고객을 4가지 그룹으로 분류합니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
              <History className="h-4 w-4" />
              과거 이력 비교
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5BE9] shadow-sm">
              <Download className="h-4 w-4" />
              데이터 내보내기
            </button>
          </div>
        </div>
      </section>

      {/* RFM 매트릭스 그리드 */}
      <div className="grid gap-4 md:grid-cols-4">
        {(Object.keys(segmentMeta) as SegmentKey[]).map((key) => {
          const meta = segmentMeta[key];
          const data = segments.find(s => s.key === key);
          const isActive = selected === key;
          const Icon = meta.icon;

          return (
            <article
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "group cursor-pointer rounded-2xl border transition-all duration-300 p-5 relative overflow-hidden",
                isActive 
                  ? "border-primary bg-white shadow-elevated ring-1 ring-primary/10 scale-[1.02]" 
                  : "border-border/90 bg-card hover:border-primary/30 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className={cn("rounded-xl p-2.5 transition-colors", isActive ? "bg-primary text-white" : "bg-[#f4f7ff] text-primary")}>
                  <Icon className="h-5 w-5" />
                </div>
                {isActive && <div className="live-point" />}
              </div>
              
              <div className="mt-4 space-y-1 relative z-10">
                <p className={cn("text-[11px] font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
                  {meta.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-foreground">{(data?.count ?? 0).toLocaleString()}</p>
                  <span className="text-xs text-muted-foreground font-medium">명</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 space-y-3 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">매출 기여도</span>
                  <span className="text-foreground">{data?.revenueShare ?? 0}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#e8edf5]">
                  <div
                    className={cn("h-full transition-all duration-1000", isActive ? "bg-primary" : "bg-primary/30")}
                    style={{ width: `${data?.revenueShare ?? 0}%` }}
                  />
                </div>
              </div>

              {/* 배경 장식 */}
              {isActive && (
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-0">
                  <Icon className="h-24 w-24 text-primary" />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 왼쪽 섹션: AI 가이드 & 테이블 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI 분석 패널 */}
          <section className="rounded-2xl border border-[#c9d8ff] bg-[#eef3ff] p-6 relative overflow-hidden">
            <div className="flex items-start gap-5 relative z-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#d5deec]">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {segmentMeta[selected].label} 집중 최적화 가이드
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">AI Insight</span>
                </h3>
                <p className="mt-2 text-sm font-medium text-[#4a5568] leading-relaxed italic">
                  "{segmentMeta[selected].desc}. {selected === 'at_risk' ? '최근 방문 주기가 길어지는 징후가 포착되었습니다. 전용 메뉴 15% 리워드 제공 시 약 24%의 복귀 전환율이 예상됩니다.' : '현재 상태를 유지하기 위한 정기적인 브랜드 뉴스레터 및 포인트 혜택 안내를 권장합니다.'}"
                </p>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "방문 빈도", val: `${activeSegment?.avgFrequency.toFixed(1) ?? 0}회/월`, icon: TrendingUp },
                    { label: "예상 전환율", val: "24.2%", icon: Target },
                    { label: "LTV 보호 가치", val: "₩4.2M", icon: BarChart3 },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-white/60 bg-white/40 p-3 shadow-sm">
                      <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-foreground">{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 장식용 블러 서클 */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
          </section>

          {/* 타겟 리스트 테이블 */}
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#f4f7ff] p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">세그먼트 타겟 리스트</h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {targetCount}명 활성화됨
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4">고객 식별자</th>
                    <th className="px-4 py-4 text-center">현재 등급</th>
                    <th className="px-4 py-4 text-center">최종 방문</th>
                    <th className="px-4 py-4">이탈 위험도</th>
                    <th className="px-6 py-4 text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {customers.map((c) => (
                    <tr key={c.customer_id} className={cn(
                      "group transition-colors hover:bg-[#f4f7ff]/50",
                      c.excluded && "opacity-40 grayscale-[0.5]"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#eef3ff] to-[#d5deec] flex items-center justify-center text-[10px] font-bold text-primary">
                            {c.name?.slice(0, 1) || "C"}
                          </div>
                          <span className="font-mono text-xs font-bold text-foreground">#{c.name || c.customer_id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                          c.segment === 'lost' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-primary border-blue-100"
                        )}>
                          {c.segment?.toUpperCase() || "GRADE"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-xs font-medium text-muted-foreground">
                        {c.last_visit_date ? new Date(c.last_visit_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8edf5]">
                            <div
                              className={cn("h-full transition-all duration-1000", c.churn_probability > 0.7 ? "bg-red-500" : "bg-amber-500")}
                              style={{ width: `${Math.round(c.churn_probability * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black w-6 tabular-nums">{Math.round(c.churn_probability * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleExclude(c.customer_id)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm",
                            c.excluded 
                              ? "bg-muted text-muted-foreground border-transparent" 
                              : "bg-white text-red-600 border-red-100 hover:bg-red-50"
                          )}
                        >
                          {c.excluded ? "포함하기" : "제외하기"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 페이지네이션 (디자인용) */}
            <div className="border-t border-border/50 bg-gray-50/30 px-6 py-3 flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Showing {customers.length} Nodes</p>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                전체 목록 보기 <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </article>
        </div>

        {/* 오른쪽 사이드바: 캠페인 실행 */}
        <div className="lg:col-span-4 space-y-6">
          <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-5">
              <div className="rounded-lg bg-[#eef3ff] p-2">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">타겟 캠페인 오케스트레이션</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] transition-all">
                <p className="text-[10px] font-bold text-primary uppercase mb-2">타겟팅 노드</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground uppercase">{segmentMeta[selected].label}</span>
                  <span className="text-sm font-bold text-primary">{targetCount}명</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#d5deec] bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">AI 추천 오퍼</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-foreground">전용 메뉴 15% 리워드 쿠폰</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[#d5deec] bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">예상 ROI</p>
                  <p className="text-lg font-bold text-emerald-600">3.8x</p>
                </div>
                <div className="p-3 rounded-xl border border-[#d5deec] bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">복귀 예상</p>
                  <p className="text-lg font-bold text-primary">24.2%</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {sentOffer ? (
                <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-100 animate-in zoom-in-95">
                  <CheckCircle2 className="h-4 w-4" />
                  캠페인 배포 완료
                </div>
              ) : (
                <button 
                  onClick={() => setSentOffer(true)}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-sm shadow-sm transition-all hover:bg-[#1E5BE9] active:scale-95"
                >
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  캠페인 실행 엔진 가동
                </button>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-[#c9d8ff] bg-[#eef3ff] p-3">
              <p className="text-[10px] font-medium leading-relaxed text-[#4a5568]">
                <span className="font-bold text-primary">AI 제언:</span> 캠페인 실행 시 담당 슈퍼바이저에게 해당 매장의 밀착 관리 가이드가 자동 전달됩니다.
              </p>
            </div>
          </article>

          {/* 추가 분석 정보 */}
          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-emerald-50 p-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-foreground">세그먼트별 매출 점유율</h4>
            </div>
            <div className="space-y-4">
              {segments.map(s => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">{segmentMeta[s.key].label}</span>
                    <span className="text-foreground">{s.revenueShare}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#e8edf5] rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", segmentMeta[s.key].color.replace('text', 'bg'))} 
                      style={{ width: `${s.revenueShare}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
