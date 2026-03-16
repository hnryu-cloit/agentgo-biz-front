import type React from "react";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Map,
  Server,
  CheckCircle2,
  Clock,
  RotateCcw,
  Database,
  TriangleAlert,
  Cpu,
  Layers,
  Zap,
  Play,
  Settings2,
  ChevronRight,
  BarChart3,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgentStatuses, getControlTowerOverview } from "@/services/hq";

type TabKey = "agents" | "workflows" | "simulation" | "data" | "risk";

type Agent = {
  id: string;
  name: string;
  health: number;
  lastRun: string;
  dailyTasks: number;
  status: "정상" | "주의" | "장애";
  type: string;
};

const initialAgents: Agent[] = [
  { id: "a1", name: "분석 에이전트", health: 98, lastRun: "2분 전", dailyTasks: 124, status: "정상", type: "Analysis" },
  { id: "a2", name: "전략 에이전트", health: 85, lastRun: "15분 전", dailyTasks: 42, status: "주의", type: "Strategy" },
  { id: "a3", name: "실행 에이전트", health: 92, lastRun: "1분 전", dailyTasks: 86, status: "정상", type: "Execution" },
  { id: "a4", name: "OCR 에이전트", health: 78, lastRun: "45분 전", dailyTasks: 21, status: "주의", type: "Vision" },
  { id: "a5", name: "리포트 에이전트", health: 100, lastRun: "10분 전", dailyTasks: 15, status: "정상", type: "Report" },
];

type WorkflowRun = {
  id: string;
  name: string;
  stage: "분석" | "전략" | "실행";
  status: "completed" | "running" | "failed" | "pending";
  store: string;
  duration?: string;
  startedAt: string;
};

const workflowRuns: WorkflowRun[] = [
  { id: "w1", name: "매출 하락 분석 → 프로모션 전략 → 쿠폰 발송", stage: "실행", status: "completed", store: "A매장", duration: "2분 14초", startedAt: "14:22" },
  { id: "w2", name: "이탈 고객 세그먼트 → RFM 오퍼 → 포인트 지급", stage: "전략", status: "running", store: "C매장", startedAt: "14:31" },
  { id: "w3", name: "메뉴 마진 분석 → 가격 조정 전략", stage: "분석", status: "failed", store: "B매장", duration: "48초", startedAt: "13:55" },
];

const regions = [
  { label: "수도권", status: "안정적 초과 달성", pct: 112 },
  { label: "충청권", status: "목표 달성 전망", pct: 98 },
  { label: "경상권", status: "목표 미달 위험", pct: 85 },
  { label: "전라권", status: "심각한 실적 하락", pct: 72, warn: "AI 제안: 지역 타겟팅 캠페인 실행" },
];

export const HqControlTowerPage = () => {
  const [tab, setTab] = useState<TabKey>("agents");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getControlTowerOverview>> | null>(null);

  useEffect(() => {
    let alive = true;
    getControlTowerOverview().then((response) => {
      if (!alive) return;
      setOverview(response);
    }).catch(() => { /* fallback 유지 */ });
    getAgentStatuses().then((response) => {
      if (!alive || response.length === 0) return;
      setAgents(response.map((agent) => ({
        id: agent.id,
        name: agent.display_name,
        health: Math.max(0, Math.round(100 - (agent.error_rate * 100))),
        lastRun: agent.last_heartbeat ?? "N/A",
        dailyTasks: 0,
        status: agent.status === "healthy" ? "정상" : agent.status === "degraded" ? "주의" : "장애",
        type: agent.agent_name,
      })));
    }).catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Global Operations Center</span>
          </div>
          <h1 className="ds-page-title">전사 통합 관제 <span className="text-muted-foreground font-light">|</span> HQ Control Tower</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl border-emerald-500/20 bg-emerald-500/5">
            <div className="live-point" />
            <span className="text-[11px] font-black text-emerald-600 uppercase">System Active</span>
          </div>
          <button className="ds-button ds-button-primary h-11 px-6">
            <Play className="h-4 w-4 mr-2 fill-current" />
            Run Global Workflow
          </button>
        </div>
      </div>

      {/* Global KPI Grid */}
      <section className="grid gap-5 md:grid-cols-4">
        {[
          { label: "전국 총 매출", val: `₩${(((overview?.revenue_total ?? 425000000) / 100000000)).toFixed(2)}억`, delta: `Δ ₩${Math.abs(Math.round(overview?.revenue_vs_last_week ?? 0)).toLocaleString()}`, icon: Activity, type: "primary" },
          { label: "운영 가맹점", val: `${overview?.total_stores ?? 248}개`, delta: `${overview?.period_label ?? "N/A"}`, icon: Building2, type: "primary" },
          { label: "정상 에이전트", val: `${overview?.agents.healthy ?? agents.filter((agent) => agent.status === "정상").length}개`, delta: `전체 ${overview?.agents.total ?? agents.length}개`, icon: Users, type: "primary" },
          { label: "에스컬레이션", val: `${overview?.active_alerts ?? 14}건`, delta: `Down ${overview?.agents.down ?? 0}개`, icon: ShieldAlert, type: "danger" },
        ].map((kpi, idx) => (
          <article key={idx} className="ds-kpi-card bg-white hover:border-primary/20">
            <div className="flex items-center justify-between">
              <p className="ds-kpi-label">{kpi.label}</p>
              <span className={cn(
                "ds-badge",
                kpi.type === "danger" ? "ds-badge-danger" : "ds-badge-success"
              )}>{kpi.delta}</span>
            </div>
            <p className="ds-kpi-value">{kpi.val}</p>
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center bg-panel-soft",
              kpi.type === "danger" ? "text-red-500" : "text-primary"
            )}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </article>
        ))}
      </section>

      {/* Orchestration Tabs */}
      <section className="ds-card overflow-hidden">
        <div className="ds-card-header !bg-panel-soft/30">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="ds-section-title">AI 에이전트 오케스트레이션</h3>
          </div>
          <div className="flex bg-muted p-1 rounded-xl">
            {(["agents", "workflows", "simulation", "data", "risk"] as TabKey[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                  tab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {tab === "agents" && (
            <div className="grid gap-6 md:grid-cols-3">
              {agents.map((agent) => (
                <div key={agent.id} className="p-6 rounded-2xl border border-border bg-white hover:border-primary/30 transition-all group shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="ds-eyebrow !text-[9px] mb-1">{agent.type}</p>
                        <h4 className="text-sm font-black text-foreground">{agent.name}</h4>
                      </div>
                    </div>
                    <span className={cn(
                      "ds-badge",
                      agent.status === "정상" ? "ds-badge-success" : "ds-badge-warning"
                    )}>{agent.status}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Health Index</p>
                      <p className="text-sm font-black text-foreground italic">{agent.health.toFixed(1)}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-panel-soft rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-500", agent.health > 90 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${agent.health}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground pt-2 uppercase italic">
                      <span>Tasks: {agent.dailyTasks}</span>
                      <span>Run: {agent.lastRun}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "workflows" && (
            <div className="space-y-4">
              {workflowRuns.map((wf) => (
                <div key={wf.id} className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-border hover:shadow-lg transition-all group">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all",
                    wf.status === "running" ? "bg-primary/10" : wf.status === "completed" ? "bg-emerald-50" : "bg-red-50"
                  )}>
                    {wf.status === "running" ? <RotateCcw className="h-7 w-7 text-primary animate-spin" /> : 
                     wf.status === "completed" ? <CheckCircle2 className="h-7 w-7 text-emerald-500" /> : <TriangleAlert className="h-7 w-7 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-black text-foreground truncate">{wf.name}</h4>
                      <span className="ds-badge ds-badge-info">{wf.stage} Stage</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" /> {wf.store} 대상 · {wf.startedAt} Initiated {wf.duration && `· ${wf.duration} Elapsed`}
                    </p>
                  </div>
                  <button className="ds-button ds-button-ghost !h-10 !w-10 !p-0 opacity-0 group-hover:opacity-100"><Settings2 className="h-5 w-5" /></button>
                </div>
              ))}
            </div>
          )}

          {tab === "simulation" && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="p-8 ds-ai-panel border-none shadow-none">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-current" /> Scenario Engine
                  </h4>
                  <div className="relative">
                    <textarea 
                      className="ds-input w-full h-40 resize-none pt-5 leading-relaxed bg-white/50 backdrop-blur-sm" 
                      placeholder="분석하고 싶은 시나리오를 입력하세요. (예: 원가 5% 인상 시 전사 마진 변화)"
                    />
                    <button className="absolute bottom-4 right-4 ds-button ds-button-primary h-12 px-8 !rounded-2xl shadow-2xl shadow-primary/40">Run Simulation</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="ds-eyebrow !text-muted-foreground/60 ml-1">Archive</p>
                  {["원가 인상 대응 시나리오", "신메뉴 출시 임팩트 분석"].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer group shadow-sm">
                      <span className="text-sm font-black text-foreground italic">{s}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 ds-glass rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-full bg-panel-soft flex items-center justify-center mb-8 border border-border shadow-inner">
                  <BarChart3 className="h-10 w-10 text-primary opacity-20" />
                </div>
                <h4 className="ds-section-title text-xl mb-3 italic">Waiting for Input...</h4>
                <p className="text-sm text-muted-foreground max-w-xs font-medium">시나리오를 입력하면 AI 모델이 실시간 전사 데이터를 동기화하여 분석을 시작합니다.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Regional & Infrastructure */}
      <div className="grid gap-8 lg:grid-cols-2">
        <article className="ds-card p-8">
          <div className="flex items-center justify-between mb-10 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="ds-section-title text-xl">권역별 목표 달성 예보</h3>
            </div>
            <button className="ds-button ds-button-ghost !text-[10px] uppercase font-black tracking-widest italic">View Details →</button>
          </div>
          
          <div className="space-y-10">
            {regions.map((r) => (
              <div key={r.label} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-foreground w-12 italic underline decoration-primary/20 decoration-4 underline-offset-4">{r.label}</span>
                    <span className={cn(
                      "ds-badge",
                      r.pct > 100 ? "ds-badge-success" : "ds-badge-warning"
                    )}>{r.status}</span>
                  </div>
                  <span className="text-lg font-black text-foreground italic">{r.pct}%</span>
                </div>
                <div className="h-2 w-full bg-panel-soft rounded-full overflow-hidden shadow-inner">
                  <div className={cn("h-full transition-all duration-1000", r.pct > 100 ? "bg-emerald-500" : r.pct > 80 ? "bg-primary" : "bg-red-500")} style={{ width: `${Math.min(r.pct, 100)}%` }} />
                </div>
                {r.warn && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <TriangleAlert className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[11px] font-black text-red-600 uppercase tracking-tighter">{r.warn}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="ds-card p-8 bg-slate-950 text-white border-none shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="ds-section-title text-xl !text-white">인프라 및 엔진 관제</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <div className="live-point" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">99.9% Up</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {[
              { label: "Data Sync", val: "248 Nodes Active", icon: Database, color: "text-emerald-400" },
              { label: "Engine Load", val: "CPU 42% / GPU 68%", icon: Activity, color: "text-blue-400" },
              { label: "API Status", val: "Auth Token Critical (D-2)", icon: ShieldAlert, color: "text-red-400" },
            ].map((node, i) => (
              <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-5">
                  <node.icon className={cn("h-6 w-6", node.color)} />
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{node.label}</p>
                    <p className="text-sm font-black text-white mt-1 italic tracking-tight">{node.val}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-all" />
              </div>
            ))}
          </div>

          <button className="ds-button w-full mt-10 h-14 bg-white/5 border border-white/10 !text-white/60 hover:bg-white/10 uppercase tracking-[0.3em] font-black transition-all shadow-none">View System Logs</button>
        </article>
      </div>
    </div>
  );
};
