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
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getResourceCatalog } from "@/services/data";
import { runWorkflow } from "@/services/hq";
import { cn } from "@/lib/utils";
import { homeCatalogMock } from "@/lib/mockData";

const quickRoutes = [
  { 
    to: "/owner/dashboard", 
    title: "점주 홈", 
    desc: "매장 수익성 및 실시간 운영 지표를 확인합니다.", 
    icon: Store, 
    role: "점주" 
  },
  { 
    to: "/supervisor/dashboard", 
    title: "수퍼바이저", 
    desc: "구역 내 리스크 매장 및 코칭 리포트를 관리합니다.", 
    icon: Users, 
    role: "SV" 
  },
  { 
    to: "/hq/control-tower", 
    title: "본사 관제", 
    desc: "전사 통합 데이터 및 에이전트 상태를 관제합니다.", 
    icon: Network, 
    role: "HQ" 
  },
  { 
    to: "/data/upload", 
    title: "데이터 업로드", 
    desc: "신규 Raw 데이터를 동기화하고 정규화합니다.", 
    icon: Upload, 
    role: "Data" 
  },
];

export const HomePage: React.FC = () => {
  const [storeCount, setStoreCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [latestDate, setLatestDate] = useState("-");
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [activities, setRecentActivity] = useState([
    { time: "09:12", title: "크리스탈 제이드 POS 적재 완료", desc: "전국 14개 매장 실시간 매출 데이터 동기화", done: true },
    { time: "08:42", title: "메뉴 마스터 업데이트", desc: "시즌 신메뉴 및 원가 데이터 반영 완료", done: true },
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
      const res = await runWorkflow({ workflow_name: "crystal_jade_full_analysis", params: { dry_run: false } });
      setWorkflowData(res);
      
      const stepsCount = Array.isArray(res.agent_steps) ? res.agent_steps.length : 5;
      for (let i = 0; i < stepsCount; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      setRecentActivity(prev => [
        { time: new Date().toLocaleTimeString().slice(0, 5), title: "통합 AI 분석 완료", desc: "크리스탈 제이드 전사 전략 동기화 완료", done: true },
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
    { label: "운영 매장", value: `${storeCount}`, unit: "개", sub: "전국 실시간 연동", icon: LayoutGrid },
    { label: "관리 메뉴", value: `${menuCount}`, unit: "개", sub: "레시피/원가 포함", icon: FileText },
    { label: "데이터 최신일", value: latestDate, unit: "", sub: "동기화 상태 정상", icon: Calendar },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-12">
      {/* 1. 상단 브랜딩 & 시뮬레이션 섹션 */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="flex flex-col justify-between rounded-2xl border border-border/90 bg-card p-8 shadow-elevated lg:col-span-7">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Crystal Jade Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              지능형 멀티에이전트<br />
              <span className="text-primary text-opacity-90">오케스트레이션 허브</span>
            </h1>
            <p className="max-w-md text-sm font-medium leading-relaxed text-slate-500">
              데이터 수집부터 점주 액션 배포까지, 크리스탈 제이드 전용 AI 에이전트들이 브랜드 가치와 수익성을 실시간으로 관리합니다.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={cn(
                "group flex h-12 items-center gap-2.5 rounded-xl bg-primary px-6 text-[14px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#1E5BE9] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0",
                isSimulating && "animate-pulse"
              )}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              전사 AI 분석 실행
            </button>
            <Link
              to="/hq/control-tower"
              className="flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-6 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              관제 현황 보기
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </section>

        {/* 활동 로그 / 실시간 스트림 (우측) */}
        <section className="rounded-2xl border border-border/90 bg-card p-6 shadow-elevated lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-[13px] font-bold uppercase tracking-tight">Real-time Stream</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="live-point" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
            </div>
          </div>

          <div className="relative h-[240px] overflow-hidden">
            <div className={cn(
              "space-y-4 transition-all duration-700",
              isSimulating && workflowData ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            )}>
              {activities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-50 bg-slate-50/50 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[13px] font-bold text-slate-800">{item.title}</p>
                      <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 시뮬레이션 진행 중일 때 나타나는 오버레이 스트림 */}
            {isSimulating && workflowData && (
              <div className="absolute inset-0 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {workflowData.agent_steps.map((step: any, idx: number) => (
                  <div key={idx} className={cn(
                    "flex items-start gap-3 transition-all duration-500",
                    idx > currentStep ? "opacity-20 scale-95" : "opacity-100 scale-100"
                  )}>
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-all",
                      idx === currentStep ? "bg-primary text-white ring-4 ring-primary/10" : 
                      idx < currentStep ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {idx < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-slate-800">
                        {step.agent} <span className="mx-1 text-slate-300">|</span> {step.step}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500 leading-snug">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 2. 핵심 지표 섹션 */}
      <section className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="group relative rounded-2xl border border-border/90 bg-card p-6 shadow-elevated transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums text-slate-900 tracking-tight">{kpi.value}</span>
                  <span className="text-sm font-bold text-slate-400">{kpi.unit}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  {kpi.sub}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 transition-colors group-hover:bg-[#eef3ff]">
                <kpi.icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-primary" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 3. 빠른 실행 (역할별 라우트) */}
      <section>
        <div className="mb-4 flex items-center gap-2 px-1">
          <Zap className="h-4 w-4 text-primary fill-primary" />
          <h2 className="text-[13px] font-bold uppercase tracking-tight text-slate-900">Operational Hubs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickRoutes.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-4 rounded-2xl border border-border/90 bg-card p-5 shadow-elevated transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-primary group-hover:text-white">
                <item.icon className="h-5 w-5 text-slate-500 transition-colors group-hover:text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h3>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-500 group-hover:bg-primary/10 group-hover:text-primary">
                    {item.role}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500 group-hover:text-slate-600">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. AI 지능형 엔진 가동 상태 (Reliability Monitor) */}
      <section className="rounded-2xl border border-[#DCE4F3] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* 설명 영역 */}
          <div className="shrink-0 md:w-72">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">시스템 신뢰도 모니터</h3>
            </div>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
              AgentGo Biz의 지능형 엔진은 실시간으로 데이터를 검증하고 인사이트를 생성하여, 점주님께 가장 정확한 운영 지침을 제공합니다.
            </p>
          </div>

          {/* 엔진 상태 영역 (구분선) */}
          <div className="hidden h-12 w-px bg-slate-100 md:block" />

          {/* 에이전트별 간결한 상태바 */}
          <div className="grid flex-1 gap-6 sm:grid-cols-3">
            {[
              { name: "데이터 정합성", info: "실시간 POS 데이터 검증", health: 99, icon: Activity },
              { name: "분석 지능", info: "Gemini 전략 도출 엔진", health: 98, icon: Sparkles },
              { name: "인사이트 배포", info: "맞춤형 액션 생성 및 전송", health: 95, icon: Zap },
            ].map((agent) => (
              <div key={agent.name} className="flex flex-col justify-center">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">{agent.name}</span>
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/10">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-black text-primary">{agent.health}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-50">
                  <div 
                    className="h-full bg-primary/80 transition-all duration-1000" 
                    style={{ width: `${agent.health}%` }} 
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-slate-400">{agent.info}</p>
              </div>
            ))}
          </div>

          {/* 관제 센터 연결 버튼 */}
          <div className="shrink-0">
            <Link
              to="/hq/control-tower"
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-primary active:scale-95"
            >
              종합 관제 센터
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
