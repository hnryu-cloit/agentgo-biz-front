import type React from "react";
import { useMemo, useState } from "react";
import {
  Bot,
  DollarSign,
  Users,
  ShoppingBag,
  Sparkles,
  Zap,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
} from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

type ActionItem = {
  id: number;
  level: "P0" | "P1";
  title: string;
  why: string;
  impact: string;
  proof: string[];
};

const actions: ActionItem[] = [
  {
    id: 1,
    level: "P0",
    title: "14~17시 세트A 타임 프로모션 실행",
    why: "비피크 시간대 고객 수가 전주 대비 31% 낮습니다.",
    impact: "예상 매출 +₩110,000",
    proof: ["비피크 방문객 12명 (전주 18명)", "우천 시 배달 주문 평균 +23%", "세트A 적용 시 객단가 +2,100원"],
  },
  {
    id: 2,
    level: "P0",
    title: "이탈 징후 고객 42명 쿠폰 발송",
    why: "미방문 기간 평균이 34일로 증가했습니다.",
    impact: "예상 복귀 고객 12명",
    proof: ["30일 이상 미방문 비중 +18%p", "유사 캠페인 복귀율 24%", "예상 ROI 3.8x"],
  },
  {
    id: 3,
    level: "P1",
    title: "메뉴B 가격 시뮬레이션 검토",
    why: "원가 상승으로 메뉴B 마진이 18.1%까지 하락했습니다.",
    impact: "가격 인상안별 손익 비교",
    proof: ["목표 마진 22% 대비 -3.9%p", "+500원 인상 시 마진 +2.1%p", "판매량 탄력성 위험: 보통"],
  },
];

const kpis = [
  { label: "어제 총 매출", value: "₩870,000", delta: "-12%", sub: "전주 동요일 대비", down: true, icon: DollarSign },
  { label: "방문 객수", value: "124", delta: "-18%", sub: "전주 동요일 대비", down: true, icon: Users },
  { label: "평균 객단가", value: "₩7,016", delta: "+2.3%", sub: "전주 동요일 대비", down: false, icon: ShoppingBag },
];

const dayCurve = [52, 61, 74, 48, 57, 83, 69];
const avgCurve = [60, 65, 70, 55, 62, 75, 72];

const marginAlerts = [
  { menu: "메뉴B (아메리카노)", margin: 18.1, target: 22 },
  { menu: "메뉴F (카페라떼)", margin: 20.4, target: 22 },
];

export const OwnerDashboardPage: React.FC = () => {
  const store = storeResources[0];
  const [proofModal, setProofModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);

  const currentProof = useMemo(() => actions.find((a) => a.id === proofModal) ?? null, [proofModal]);
  const currentConfirm = useMemo(() => actions.find((a) => a.id === confirmModal) ?? null, [confirmModal]);
  const maxCurve = Math.max(...dayCurve, ...avgCurve);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="live-point" />
            <span className="ds-eyebrow">Real-time Operations</span>
          </div>
          <h1 className="ds-page-title">{store?.name} <span className="text-muted-foreground font-light">|</span> 점주 대시보드</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <Bot className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">AI Agent Active</span>
          </div>
          <button className="ds-button ds-button-outline h-10 px-4">
            <Calendar className="h-4 w-4 mr-2" />
            운영 리포트
          </button>
        </div>
      </div>

      {/* AI Morning Briefing */}
      <section className="ds-ai-panel">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-24 w-24 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="ds-section-title text-xl font-black">AI 모닝 브리핑</h2>
              <p className="text-sm text-muted-foreground font-medium">2026-03-15 · 데이터 기반 최적화 가이드</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "전일 실적", val: "₩870,000", sub: "목표 104% 달성", status: "success", info: "객단가 상승이 긍정적입니다." },
              { label: "오늘 예측", val: "₩912,000", sub: "배달 주문 +15% 전망", status: "info", info: "오후 2시 비 예보 대응 필요." },
              { label: "리스크 감지", val: "재고 부족 의심", sub: "미확인 공지 1건", status: "warning", info: "포장재 실사 마감이 임박했습니다." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-5 shadow-sm group hover:border-primary/20 transition-all">
                <p className="ds-eyebrow !text-[10px] mb-2">{item.label}</p>
                <p className="text-xl font-black text-foreground mb-2">{item.val}</p>
                <span className={cn(
                  "ds-badge mb-3",
                  item.status === "success" ? "ds-badge-success" : item.status === "info" ? "ds-badge-info" : "ds-badge-warning"
                )}>{item.sub}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5 font-medium">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" /> {item.info}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid gap-5 md:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="ds-kpi-card">
            <div className="flex items-center justify-between">
              <p className="ds-kpi-label">{kpi.label}</p>
              <div className={cn(
                "ds-kpi-delta shadow-sm",
                kpi.down ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {kpi.down ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                {kpi.delta}
              </div>
            </div>
            <p className="ds-kpi-value">{kpi.value}</p>
            <p className="text-[11px] font-bold text-subtle-foreground uppercase tracking-widest">{kpi.sub}</p>
          </article>
        ))}
        
        {/* Target Gauge */}
        <article className="ds-kpi-card bg-ai-gradient border-none text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Sparkles className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <p className="ds-kpi-label !text-white/70">AI 예상 달성률</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="ds-kpi-value !text-white leading-none">104%</p>
              <p className="text-[11px] font-black uppercase mb-1.5 opacity-80">Over Target</p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full shadow-[0_0_10px_white]" style={{ width: "100%" }} />
            </div>
          </div>
        </article>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Actions Section */}
        <section className="lg:col-span-7 ds-card">
          <div className="ds-card-header">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary fill-primary" />
              <h3 className="ds-section-title">운영 최적화 액션</h3>
            </div>
            <span className="ds-badge ds-badge-info">{done.length}/{actions.length} Completed</span>
          </div>
          <div className="p-6 space-y-4">
            {actions.map((action) => (
              <article key={action.id} className={cn(
                "p-5 rounded-2xl border transition-all",
                done.includes(action.id) ? "bg-panel-soft/50 opacity-50 grayscale" : "bg-white border-border hover:border-primary/30 hover:shadow-md"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors",
                    done.includes(action.id) ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {done.includes(action.id) ? <CheckCircle2 className="h-5 w-5" /> : `0${action.id}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("ds-badge", action.level === "P0" ? "ds-badge-danger" : "ds-badge-warning")}>{action.level}</span>
                      <h4 className="font-bold text-foreground">{action.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-4 leading-relaxed">{action.why}</p>
                    {!done.includes(action.id) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-tighter">
                          <TrendingUp className="h-3.5 w-3.5" /> {action.impact}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setProofModal(action.id)} className="ds-button ds-button-ghost h-9 px-4 !text-[10px] uppercase tracking-widest">Evidence</button>
                          <button onClick={() => setConfirmModal(action.id)} className="ds-button ds-button-primary h-9 px-4 !text-[10px] uppercase tracking-widest shadow-none">Run Now</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Right Sidebar Charts */}
        <div className="lg:col-span-5 space-y-8">
          <article className="ds-card p-6">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
              <h3 className="ds-section-title text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                시간대별 매출 추이
              </h3>
              <div className="flex gap-3 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Today</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-muted" /> Avg</span>
              </div>
            </div>
            <div className="flex h-32 items-end gap-2 px-1">
              {dayCurve.map((point, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full group">
                  <div className="relative w-full flex-1 flex items-end justify-center gap-[1px]">
                    <div className="w-1/2 bg-muted/40 rounded-t-sm" style={{ height: `${(avgCurve[idx] / maxCurve) * 100}%` }} />
                    <div className="w-1/2 bg-primary rounded-t-sm group-hover:bg-primary-hover transition-colors" style={{ height: `${(point / maxCurve) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-1 text-[10px] font-black text-subtle-foreground font-mono">
              {["09h", "12h", "15h", "18h", "21h"].map(t => <span key={t}>{t}</span>)}
            </div>
          </article>

          <article className="ds-card overflow-hidden">
            <div className="ds-card-header bg-red-50/30">
              <h3 className="ds-section-title text-base flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                마진 가드 경보
              </h3>
              <span className="ds-badge ds-badge-danger shadow-none">Attention</span>
            </div>
            <div className="p-6 space-y-4">
              {marginAlerts.map((alert) => (
                <div key={alert.menu} className="p-4 rounded-2xl bg-panel-soft/50 border border-border/50 flex items-center justify-between group hover:border-red-200 transition-all">
                  <div>
                    <p className="text-sm font-black text-foreground">{alert.menu}</p>
                    <p className="text-[11px] font-bold text-red-500 mt-1 uppercase tracking-tighter">Margin: {alert.margin}% (Target: {alert.target}%)</p>
                  </div>
                  <button className="ds-button ds-button-ghost !h-8 !px-3 !text-[10px] uppercase font-black tracking-widest group-hover:text-primary group-hover:bg-white shadow-sm border border-transparent group-hover:border-border">Simulate →</button>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      {/* Proof Modal */}
      {currentProof && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl ds-glass p-8 rounded-3xl border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
            <div className="flex items-center justify-between mb-8">
              <h4 className="ds-section-title text-2xl font-black italic">Action Evidence</h4>
              <button onClick={() => setProofModal(null)} className="ds-button ds-button-ghost !h-10 !w-10 !p-0 rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
              <p className="ds-eyebrow mb-2">Target Strategy</p>
              <p className="text-lg font-black text-primary italic underline underline-offset-4 decoration-primary/30">{currentProof.title}</p>
            </div>
            <div className="space-y-4">
              <p className="ds-eyebrow !text-muted-foreground/60 mb-2">Diagnostic Data Points</p>
              {currentProof.proof.map((line, i) => (
                <div key={line} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-border/50 shadow-sm">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 border border-primary/10 font-mono">{i + 1}</span>
                  <p className="text-sm font-bold leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setProofModal(null)} className="ds-button ds-button-primary w-full mt-10 h-14 !rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] font-black">Close Investigation</button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {currentConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md ds-card p-8 shadow-2xl animate-in zoom-in-95 duration-200 border-none">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 mx-auto">
              <Zap className="h-10 w-10 text-primary fill-primary animate-pulse" />
            </div>
            <h4 className="ds-section-title text-2xl text-center mb-2 font-black">Confirm Execution?</h4>
            <p className="text-muted-foreground text-center mb-8 font-medium italic">이 제안을 즉시 가맹점에 적용하시겠습니까?</p>
            <div className="bg-panel-soft rounded-2xl p-5 mb-10 text-center border border-border/50">
              <p className="text-sm font-black text-foreground uppercase tracking-tight leading-relaxed">{currentConfirm.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmModal(null)} className="ds-button ds-button-outline h-14 uppercase tracking-widest font-black">Dismiss</button>
              <button onClick={() => { setDone((prev) => [...prev, currentConfirm.id]); setConfirmModal(null); }} className="ds-button ds-button-primary bg-ai-gradient border-none h-14 uppercase tracking-widest font-black shadow-2xl shadow-primary/30">Deploy Action</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
