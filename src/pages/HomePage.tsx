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
import { getAgentSystemStatus, runWorkflow } from "@/services/hq";
import { getOwnerDashboard } from "@/services/owner";
import { useAuth } from "@/contexts/useAuth";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";

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
  const { user } = useAuth();
  const [storeCount, setStoreCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [latestDate, setLatestDate] = useState("-");
  const [engineHealth, setEngineHealth] = useState([
    { name: "데이터 정합성", info: "실시간 POS 데이터 검증", health: 0, icon: Activity },
    { name: "분석 지능", info: "매출/리스크 분석 엔진", health: 0, icon: Sparkles },
    { name: "인사이트 배포", info: "액션 생성 및 전송", health: 0, icon: Zap },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [activities, setRecentActivity] = useState([
    { time: "09:12", title: "크리스탈 제이드 POS 적재 완료", desc: "전국 14개 매장 실시간 매출 데이터 동기화", done: true },
    { time: "08:42", title: "메뉴 마스터 업데이트", desc: "시즌 신메뉴 및 원가 데이터 반영 완료", done: true },
  ]);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);

    const loadHomeData = async () => {
      const systemStatus = await getAgentSystemStatus();
      if (!alive) return;

      if (user?.role === "store_owner") {
        const ownerDashboard = await getOwnerDashboard();
        if (!alive) return;
        setStoreCount(ownerDashboard.store_name ? 1 : 0);
        setMenuCount(ownerDashboard.ai_analysis?.menu_strategy?.menu_matrix?.length ?? 0);
        setLatestDate(ownerDashboard.latest_date ?? "-");
        return systemStatus;
      }

      const catalog = await getResourceCatalog();
      if (!alive) return;
      const posSource = catalog.sources.find((s) => s.source_kind === "pos_daily_sales");
      const menuSource = catalog.sources.find((s) => s.source_kind === "menu_lineup");
      setStoreCount(posSource?.stores.length ?? 0);
      setMenuCount(menuSource?.stores.reduce((acc, store) => acc + store.file_count, 0) ?? 0);
      setLatestDate(posSource?.stores[0]?.date_end ?? "-");
      return systemStatus;
    };

    loadHomeData()
      .then((systemStatus) => {
        if (!alive) return;

        const agents = Array.isArray((systemStatus as { agents?: unknown[] }).agents)
          ? ((systemStatus as { agents: Array<{ agent_name: string; status: string }> }).agents)
          : [];

        const mapStatusToHealth = (status?: string) => {
          if (status === "healthy") return 98;
          if (status === "degraded") return 72;
          if (status === "down") return 18;
          return 0;
        };

        setEngineHealth([
          {
            name: "데이터 정합성",
            info: "실시간 POS 데이터 검증",
            health: mapStatusToHealth(agents.find((agent) => agent.agent_name === "analysis_agent")?.status),
            icon: Activity,
          },
          {
            name: "분석 지능",
            info: "매출/리스크 분석 엔진",
            health: mapStatusToHealth(agents.find((agent) => agent.agent_name === "strategy_agent")?.status),
            icon: Sparkles,
          },
          {
            name: "인사이트 배포",
            info: "액션 생성 및 전송",
            health: mapStatusToHealth(agents.find((agent) => agent.agent_name === "execution_agent")?.status),
            icon: Zap,
          },
        ]);
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "홈 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => { alive = false; };
  }, [user?.role]);

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

  if (isLoading) {
    return <LoadingState message="홈 대시보드를 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="홈 데이터를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
      {/* 페이지 헤더 */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="flex flex-col justify-between rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6 lg:col-span-7">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">통합 홈</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">운영 홈</h2>
            <p className="mt-1 text-sm text-slate-500">
              데이터 적재 현황, 주요 운영 허브, 엔진 상태를 한 화면에서 확인합니다.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9] disabled:opacity-70",
                isSimulating && "animate-pulse"
              )}
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              전사 AI 분석 실행
            </button>
            <Link
              to="/hq/control-tower"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE4F3] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#F7FAFF]"
            >
              관제 현황 보기
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </section>

        {/* 활동 로그 / 실시간 스트림 (우측) */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6 lg:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">실시간 운영 로그</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="live-point" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Live</span>
            </div>
          </div>

          <div className="relative h-[240px] overflow-hidden">
            <div className={cn(
              "space-y-4 transition-all duration-700",
              isSimulating && workflowData ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            )}>
              {activities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3.5 shadow-sm">
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
      <section className="grid gap-3 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{kpi.value}</span>
                  <span className="text-sm font-medium text-slate-400">{kpi.unit}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  정상 운영
                </p>
              </div>
              <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 3. 빠른 실행 (역할별 라우트) */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-bold text-slate-900">바로 가기</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickRoutes.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-4 rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] p-5 shadow-sm transition-colors hover:bg-white"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <span className="rounded border border-[#DCE4F3] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {item.role}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. AI 지능형 엔진 가동 상태 (Reliability Monitor) */}
      <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">엔진 상태</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">시스템 신뢰도 모니터</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[280px_1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">운영 엔진 상태</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              데이터 검증, 분석, 인사이트 배포 상태를 확인합니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {engineHealth.map((agent) => (
              <div key={agent.name} className="rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">{agent.name}</span>
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/10">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-black text-primary">{agent.health}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF4FF]">
                  <div 
                    className="h-full bg-primary/80 transition-all duration-1000" 
                    style={{ width: `${agent.health}%` }} 
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-slate-400">{agent.info}</p>
              </div>
            ))}
          </div>
          <div className="shrink-0">
            <Link
              to="/hq/control-tower"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE4F3] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#F7FAFF]"
            >
              관제 센터
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
