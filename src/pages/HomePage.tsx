import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Users,
  Network,
  Upload,
  FileText,
  Calendar,
  Zap,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  Clock,
  Activity,
  Bot,
  Play,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getResourceCatalog } from "@/services/data";
import { runWorkflow } from "@/services/hq";
import { cn } from "@/lib/utils";
import { homeCatalogMock } from "@/lib/mockData";

const quickRoutes = [
  { to: "/owner/dashboard", title: "점주 홈", desc: "크리스탈 제이드 매장 운영 최적화 및 오늘 할 일을 확인하세요.", icon: Store, badge: "점주" },
  { to: "/supervisor/dashboard", title: "수퍼바이저", desc: "담당 크리스탈 제이드 가맹점 리스크 및 코칭 리포트를 관리합니다.", icon: Users, badge: "SV" },
  { to: "/hq/control-tower", title: "본사 관제", desc: "전국 크리스탈 제이드 에이전트 상태 및 지표를 통합 관제합니다.", icon: Network, badge: "HQ" },
  { to: "/data/upload", title: "데이터 업로드", desc: "POS/영수증/CRM 등 원천 데이터를 실시간으로 동기화합니다.", icon: Upload, badge: "Data" },
];

export const HomePage: React.FC = () => {
  const [storeCount, setStoreCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [latestDate, setLatestDate] = useState("-");
  
  // 워크플로우 시뮬레이션 상태
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [activities, setRecentActivity] = useState([
    { time: "09:12", title: "크리스탈 제이드 POS 적재 완료", desc: "전국 14개 매장 실시간 매출 데이터 동기화 성공", done: true },
    { time: "08:42", title: "메뉴 마스터 업데이트", desc: "봄 시즌 신메뉴 및 원가 데이터 반영 완료", done: true },
  ]);

  useEffect(() => {
    let alive = true;
    getResourceCatalog().then((catalog) => {
      if (!alive) return;
      const posSource = catalog.sources.find(s => s.source_kind === "pos_daily_sales");
      setStoreCount(posSource?.stores.length || 14);
      setMenuCount(catalog.sources.find(s => s.source_kind === "menu_lineup")?.stores.length || 120);
      setLatestDate(posSource?.stores[0]?.date_end || "2026-03-17");
    }).catch(() => {
      if (!alive) return;
      setStoreCount(14);
      setMenuCount(120);
      setLatestDate("2026-03-17");
    });
    return () => { alive = false; };
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setCurrentStep(0);
    
    try {
      // 1. 백엔드 API 호출 (브랜드 특화 워크플로우 실행)
      const res = await runWorkflow({ workflow_name: "crystal_jade_full_analysis", params: { dry_run: false } });
      setWorkflowData(res);
      
      // 2. 단계별 애니메이션 시뮬레이션
      const stepsCount = Array.isArray(res.agent_steps) ? res.agent_steps.length : 5;
      for (let i = 0; i < stepsCount; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // 3. 완료 처리
      setRecentActivity(prev => [
        { time: new Date().toLocaleTimeString().slice(0, 5), title: "크리스탈 제이드 통합 AI 분석 완료", desc: "전국 매장 리스크 및 메뉴 전략 동기화 완료", done: true },
        ...prev
      ]);
      
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setIsSimulating(false);
      setCurrentStep(-1);
    }
  };

  const kpis = [
    { label: "크리스탈 제이드 매장", value: `${storeCount}개`, sub: "전국 직영/가맹 합산", icon: LayoutGrid },
    { label: "메뉴 데이터 연동", value: `${menuCount}개`, sub: "레시피/원가 정보 포함", icon: FileText },
    { label: "데이터 기준일", value: latestDate, sub: "실시간 동기화 중", icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Simulation Hub */}
      <section className="rounded-3xl border border-[#BFD4FF] bg-gradient-to-br from-[#EEF4FF] via-white to-[#F7FAFF] p-6 md:p-10 shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 select-none">
          <Bot className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Crystal Jade Intelligence Hub
          </p>
          <h1 className="mt-4 font-title text-4xl font-black leading-tight text-slate-900 md:text-5xl">
            크리스탈 제이드<br />지능형 멀티에이전트
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium text-slate-500 leading-relaxed">
            데이터 수집부터 점주 액션 생성까지, 크리스탈 제이드 전용 AI 에이전트들이<br />
            프리미엄 브랜드 가치와 매장 수익성을 실시간으로 관리합니다.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-base font-black text-white shadow-xl shadow-primary/30 transition-all hover:bg-[#1E5BE9] hover:-translate-y-1 active:scale-95 disabled:opacity-70",
                isSimulating && "animate-pulse"
              )}
            >
              {isSimulating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
              크리스탈 제이드 통합 AI 분석 실행
            </button>
            <Link
              to="/hq/control-tower"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-[#D6E0F0] bg-white px-8 py-4 text-base font-bold text-slate-700 transition-all hover:bg-[#F8FAFF] hover:border-primary/30"
            >
              전사 관제 현황
              <ArrowRight className="h-5 w-5 text-slate-300" />
            </Link>
          </div>
        </div>

        {/* Workflow Stream UI */}
        {isSimulating && workflowData && (
          <div className="mt-12 rounded-2xl bg-white/80 backdrop-blur-md border border-white p-6 shadow-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Crystal Jade Agent Stream</h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase animate-pulse">Processing</span>
            </div>
            
            <div className="space-y-6">
              {workflowData.agent_steps.map((step: any, idx: number) => (
                <div key={idx} className={cn(
                  "flex items-start gap-4 transition-all duration-500",
                  idx > currentStep ? "opacity-20 grayscale scale-95" : "opacity-100 scale-100"
                )}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs transition-all",
                    idx === currentStep ? "bg-primary text-white ring-4 ring-primary/20 animate-bounce" : 
                    idx < currentStep ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {idx < currentStep ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900">{step.agent} <span className="mx-2 text-slate-200 font-normal">|</span> {step.step}</p>
                      {idx === currentStep && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-500 leading-relaxed">{step.message}</p>
                    {idx === currentStep && (
                      <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress-fast" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Quick Access & Status */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            {quickRoutes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex flex-col gap-5 rounded-2xl border border-border/60 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-[#EEF4FF] p-3 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
                  <kpi.icon className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{kpi.value}</p>
                <p className="mt-1.5 text-xs font-bold text-slate-400">{kpi.sub}</p>
              </article>
            ))}
          </section>
        </div>

        <div className="space-y-6">
          <article className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black text-slate-900 uppercase">CJ Activity Log</h3>
              </div>
              <div className="live-point" />
            </div>
            <div className="space-y-5">
              {activities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{item.time} · {item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border/60 bg-slate-900 p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-tight">Agent Health</h3>
            </div>
            <div className="space-y-5">
              {[
                { name: "Analysis Agent", health: 99 },
                { name: "Strategy Agent", health: 98 },
                { name: "Execution Agent", health: 95 },
              ].map((agent) => (
                <div key={agent.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-tighter text-slate-400">{agent.name}</span>
                    <span className="text-xs font-black font-mono text-primary">{agent.health}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${agent.health}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/hq/control-tower"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/20 active:scale-95"
            >
              System Monitoring <ArrowRight className="h-3 w-3" />
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
};
