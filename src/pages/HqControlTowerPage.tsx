import type React from "react";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
  Map,
  Server,
  CheckCircle2,
  RotateCcw,
  Database,
  TriangleAlert,
  Cpu,
  Play,
  Settings2,
  Globe,
  Layers,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistActionBar } from "@/components/commons/AssistActionBar";
import { InlineAssistPanel } from "@/components/commons/InlineAssistPanel";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { getAgentStatuses, getAgentSystemStatus, getAlerts, getControlTowerOverview, runWorkflow } from "@/services/hq";
import { getUploadJobs } from "@/services/data";
import { getStoreIntelligence, type StoreIntelligence } from "@/services/analysis";
import type { AlertResponse, UploadJobResponse } from "@/types/api";

type TabKey = "agents" | "workflows" | "data" | "risk";

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
  { id: "a1", name: "분석 에이전트", health: 99, lastRun: "1분 전", dailyTasks: 14, status: "정상", type: "analysis" },
  { id: "a2", name: "전략 에이전트", health: 98, lastRun: "4분 전", dailyTasks: 5, status: "정상", type: "strategy" },
  { id: "a3", name: "실행 에이전트", health: 95, lastRun: "2분 전", dailyTasks: 8, status: "주의", type: "execution" },
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

const regions = [
  { label: "수도권 CJ", status: "광화문·소공·용산 운영 중", pct: 101 },
  { label: "영남권 CJ", status: "대구·서면·센텀 회복 흐름", pct: 108 },
  { label: "리테일몰 CJ", status: "IFC·인스파이어·AK분당 모니터링", pct: 96 },
  { label: "백화점 CJ", status: "천호·압구정 객수 변동성 주의", pct: 89, warn: "AI 제안: 백화점 점포 디너 피크 인력 재배치 권고" },
];

const infraNodes = [
  { label: "데이터 동기화", val: "CJ POS 14 / DODO 1 / MENU 1 적재", icon: Database, status: "정상" },
  { label: "엔진 부하", val: "analysis 2 healthy / execution 1 degraded", icon: Activity, status: "정상" },
  { label: "API 상태", val: "receipt_listing 1건 업로드 실패", icon: ShieldAlert, status: "경고" },
];

const tabLabels: Record<TabKey, string> = {
  agents: "에이전트 상태",
  workflows: "워크플로우",
  data: "데이터 관리",
  risk: "리스크 관제",
};

function openAiAssist(label: string, prompt: string, contextText?: string, intent: "summary" | "action" = "summary") {
  window.dispatchEvent(new CustomEvent("agentgo-ai-assist", {
    detail: { label, prompt, contextText, intent },
  }));
}

export const HqControlTowerPage: React.FC = () => {
  const [tab, setTab] = useState<TabKey>("agents");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getControlTowerOverview>> | null>(null);
  const [uploadJobs, setUploadJobs] = useState<UploadJobResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [flagshipIntelligence, setFlagshipIntelligence] = useState<StoreIntelligence | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [agentSystemStatus, setAgentSystemStatus] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [selectedAssistCard, setSelectedAssistCard] = useState<string | null>(null);
  const [inlineAssist, setInlineAssist] = useState<{ cardId: string; title: string; why: string; actionLabel: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      getControlTowerOverview(),
      getAgentStatuses(),
      getUploadJobs(),
      getAlerts(),
      getStoreIntelligence("[CJ]광화문점").catch(() => null),
      getAgentSystemStatus().catch(() => null),
    ])
      .then(([overviewResponse, agentResponse, jobs, alertList, intelligence, systemStatus]) => {
        if (!alive) return;
        setOverview(overviewResponse);
        setUploadJobs(jobs.slice(0, 5));
        setAlerts(alertList.slice(0, 5));
        setFlagshipIntelligence(intelligence);
        setAgentSystemStatus(systemStatus);
        setAgents(
          agentResponse.map((agent) => ({
            id: agent.id,
            name: agent.display_name,
            health: Math.max(0, Math.round(100 - (agent.error_rate * 100))),
            lastRun: agent.last_heartbeat ?? "N/A",
            dailyTasks: 0,
            status: agent.status === "healthy" ? "정상" : agent.status === "degraded" ? "주의" : "장애",
            type: agent.agent_name,
          })),
        );
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "본사 관제 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => { alive = false; };
  }, []);

  const handleRunWorkflow = async () => {
    setIsRunningWorkflow(true);
    try {
      const response = await runWorkflow({
        workflow_name: "hq_control_tower_run",
        params: { dry_run: false },
      });
      const run = response as {
        workflow_id?: string;
        workflow_name?: string;
        status?: "completed" | "running" | "failed" | "pending";
        store_id?: string | null;
        triggered_at?: string;
      };
      const startedAt = run.triggered_at ? new Date(run.triggered_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "지금";
      setWorkflowRuns((current) => [
        {
          id: run.workflow_id ?? crypto.randomUUID(),
          name: run.workflow_name ?? "전사 워크플로우 실행",
          stage: "실행",
          status: run.status ?? "completed",
          store: run.store_id ?? "전사",
          startedAt,
        },
        ...current,
      ]);
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const handleAssist = (
    cardId: string,
    label: string,
    prompt: string,
    contextText?: string,
    intent: "summary" | "action" = "summary",
  ) => {
    setSelectedAssistCard(cardId);
    setInlineAssist({
      cardId,
      title: label,
      why: contextText
        ? `${contextText}가 전사 영향과 우선순위에 어떤 의미인지 먼저 봐야 합니다.`
        : "이 항목은 본사 우선순위와 에스컬레이션 판단에 바로 연결됩니다.",
      actionLabel: intent === "action"
        ? "전사 영향이 큰 항목 1건만 먼저 정리하세요."
        : "해설을 본 뒤 추천 조치로 개입 대상을 정리하세요.",
    });
    openAiAssist(label, prompt, contextText, intent);
  };

  if (isLoading) {
    return <LoadingState message="본사 관제 데이터를 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="본사 관제 데이터를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 pb-10">

      {/* 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Global Operations Center</p>
              <h1 className="text-xl font-bold text-foreground">전사 통합 관제 타워</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-3 py-2">
              <div className="live-point" />
              <span className="text-xs font-semibold text-emerald-600">시스템 정상</span>
            </div>
            <button
              onClick={handleRunWorkflow}
              disabled={isRunningWorkflow}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5BE9] shadow-sm disabled:opacity-60"
            >
              <Play className="h-4 w-4 fill-current" />
              {isRunningWorkflow ? "실행 중..." : "전사 워크플로우 실행"}
            </button>
          </div>
        </div>
      </section>

      {/* KPI 그리드 */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "CJ 총 매출", val: `₩${(((overview?.revenue_total ?? 110148300) / 100000000)).toFixed(2)}억`, delta: `전일 대비 ₩${Math.abs(Math.round(overview?.revenue_vs_last_week ?? 0)).toLocaleString()}`, icon: Activity, warn: false },
          { label: "운영 가맹점", val: `${overview?.total_stores ?? 13}개`, delta: overview?.period_label ?? "2026-02-28 기준", icon: Building2, warn: false },
          { label: "정상 에이전트", val: `${overview?.agents.healthy ?? agents.filter((a) => a.status === "정상").length}개`, delta: `전체 ${overview?.agents.total ?? agents.length}개 중`, icon: Users, warn: false },
          { label: "에스컬레이션", val: `${overview?.active_alerts ?? 0}건`, delta: `다운 ${overview?.agents.down ?? 0}개`, icon: ShieldAlert, warn: true },
        ].map((kpi, idx) => (
          <article
            key={idx}
            className={cn(
              "rounded-2xl border p-5 shadow-elevated transition-all",
              selectedAssistCard === `hq-kpi-${kpi.label}`
                ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
                : "border-border/90 bg-card",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.val}</p>
                <p className={cn("text-xs font-medium", kpi.warn ? "text-red-500" : "text-muted-foreground")}>{kpi.delta}</p>
              </div>
              <div className={cn("rounded-xl p-2.5", kpi.warn ? "bg-red-50" : "bg-[#eef3ff]")}>
                <kpi.icon className={cn("h-5 w-5", kpi.warn ? "text-red-500" : "text-primary")} />
              </div>
            </div>
            <AssistActionBar
              className="mt-4"
              compact
              summary={{
                label: "해설 보기",
                onClick: () => handleAssist(`hq-kpi-${kpi.label}`, `${kpi.label} 해설`, `${kpi.label}를 본사 관점에서 해설해줘`, `${kpi.label}: ${kpi.val}`),
              }}
              action={{
                label: "추천 조치",
                onClick: () => handleAssist(`hq-kpi-${kpi.label}`, `${kpi.label} 추천 조치`, `${kpi.label} 기준으로 본사가 취할 조치를 알려줘`, `${kpi.label}: ${kpi.val}`, "action"),
              }}
              compare={{
                label: "비교 보기",
                onClick: () => handleAssist(`hq-kpi-${kpi.label}`, `${kpi.label} 비교 보기`, `${kpi.label}를 다른 관제 지표와 비교해서 설명해줘`, `${kpi.label}: ${kpi.val}`),
              }}
            />
          </article>
        ))}
      </section>

      {inlineAssist && inlineAssist.cardId.startsWith("hq-kpi-") && (
        <InlineAssistPanel
          title={inlineAssist.title}
          why={inlineAssist.why}
          actionLabel={inlineAssist.actionLabel}
        />
      )}

      <AssistActionBar
        summary={{
          label: "해설 보기",
          onClick: () => openAiAssist("본사 현황 해설", "지금 본사 관제 화면에서 가장 중요한 변화를 해설해줘", "전사 통합 관제 타워"),
        }}
        action={{
          label: "추천 조치",
          onClick: () => openAiAssist("본사 추천 조치", "본사 사용자가 지금 바로 해야 할 조치를 알려줘", "에스컬레이션 및 운영 가맹점 현황", "action"),
        }}
        compare={{
          label: "비교 보기",
          onClick: () => openAiAssist("권역 비교", "수도권, 영남권, 리테일몰, 백화점 권역을 비교해서 설명해줘", "권역 비교"),
        }}
      />

      {flagshipIntelligence && (
        <section
          className={cn(
            "rounded-2xl border p-5 shadow-elevated md:p-6 transition-all",
            selectedAssistCard === "hq-flagship"
              ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
              : "border-[#CFE0FF] bg-[#F7FAFF]",
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">플래그십 매장 AI 실데이터 브리핑</h3>
            <span className="ml-auto rounded-full border border-[#CFE0FF] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              [CJ]광화문점
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{flagshipIntelligence.summary}</p>
          <AssistActionBar
            className="mt-4"
            compact
            summary={{
              label: "해설 보기",
              onClick: () => handleAssist("hq-flagship", "광화문점 해설", "광화문점 브리핑 내용을 본사 관점에서 해설해줘", flagshipIntelligence.summary),
            }}
            action={{
              label: "추천 조치",
              onClick: () => handleAssist("hq-flagship", "광화문점 조치", "광화문점 브리핑 기준으로 본사가 취할 조치를 알려줘", flagshipIntelligence.summary, "action"),
            }}
            compare={{
              label: "비교 보기",
              onClick: () => handleAssist("hq-flagship", "광화문점 비교 보기", "광화문점 인사이트를 다른 플래그십 매장과 비교해서 설명해줘", flagshipIntelligence.summary),
            }}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { label: "매출", value: `${flagshipIntelligence.metrics.sales.today_revenue.toLocaleString()}원` },
              { label: "객단가", value: `${flagshipIntelligence.metrics.sales.avg_order_value.toLocaleString()}원` },
              { label: "최근 7일 방문", value: `${flagshipIntelligence.metrics.churn.recent_7d_visits.toLocaleString()}건` },
              { label: "ROI", value: `${flagshipIntelligence.metrics.roi_rate.toFixed(1)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {inlineAssist && inlineAssist.cardId === "hq-flagship" && (
        <InlineAssistPanel
          title={inlineAssist.title}
          why={inlineAssist.why}
          actionLabel={inlineAssist.actionLabel}
        />
      )}

      {/* 오케스트레이션 탭 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated">
        <div className="flex flex-col gap-4 border-b border-border/50 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#eef3ff] p-2">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground">AI 에이전트 오케스트레이션</h2>
          </div>
          <div className="flex gap-1">
            {(Object.keys(tabLabels) as TabKey[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                  tab === t
                    ? "bg-primary text-white"
                    : "border border-[#d5deec] bg-[#f4f7ff] text-[#34415b] hover:bg-[#eef3ff]"
                )}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 md:p-6">
          {tab === "agents" && (
            <div className="grid gap-4 md:grid-cols-3">
              {agents.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[#eef3ff] p-2">
                        <Cpu className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{agent.type}</p>
                        <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      agent.status === "정상" ? "bg-emerald-50 text-emerald-600" :
                      agent.status === "주의" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>{agent.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>헬스 지수</span>
                      <span className="font-semibold text-foreground">{agent.health}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
                      <div
                        className={cn("h-full transition-all duration-500", agent.health > 90 ? "bg-emerald-500" : "bg-amber-500")}
                        style={{ width: `${agent.health}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                      <span>일간 작업 {agent.dailyTasks}건</span>
                      <span>최근 실행 {agent.lastRun}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "workflows" && (
            workflowRuns.length === 0 ? (
              <EmptyState
                title="아직 실행된 워크플로우가 없습니다"
                description="상단의 전사 워크플로우 실행 버튼으로 분석 파이프라인을 시작할 수 있습니다."
              />
            ) : (
              <div className="space-y-3">
                {workflowRuns.map((wf) => (
                  <div key={wf.id} className="flex items-center gap-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 hover:border-[#b8ccff] hover:bg-[#eef3ff] transition-all group">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      wf.status === "running" ? "bg-primary/10" : wf.status === "completed" ? "bg-emerald-50" : "bg-red-50"
                    )}>
                      {wf.status === "running" ? <RotateCcw className="h-5 w-5 text-primary animate-spin" /> :
                       wf.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                       <TriangleAlert className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{wf.name}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {wf.store} · {wf.startedAt} 시작{wf.duration && ` · 소요 ${wf.duration}`}
                      </p>
                    </div>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">{wf.stage} 단계</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
                      <Settings2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "data" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">최근 데이터 업로드 현황</p>
                  <div className="space-y-3">
                    {uploadJobs.length > 0 ? uploadJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{job.original_filename}</span>
                        </div>
                        <span className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                          job.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-primary"
                        )}>{job.status.toUpperCase()}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">최근 업로드 내역이 없습니다.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 flex flex-col justify-center items-center text-center gap-2">
                  <Database className="h-8 w-8 text-primary opacity-20" />
                  <p className="text-sm font-semibold text-foreground">데이터 관리 센터</p>
                  <p className="text-xs text-muted-foreground">모든 가맹점의 Raw 데이터 정규화 상태를 관리합니다.</p>
                  <a href="/data/upload" className="mt-2 rounded-lg border border-[#d5deec] bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-[#eef3ff]">
                    상세 내역 보기
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === "risk" && (
            <div className="space-y-6">
              {/* AI 리스크 요약 섹션 (신규) */}
              {overview?.ai_anomalies && overview.ai_anomalies.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">AI Real-time Anomaly Detection</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {overview.ai_anomalies.map((anomaly, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-red-100/50">
                        <div className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full animate-pulse",
                          anomaly.type === "danger" ? "bg-red-500" : "bg-amber-500"
                        )} />
                        <div>
                          <p className="text-sm font-black text-slate-900">{anomaly.title}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">{anomaly.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#d5deec] bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">매장별 리스크 히트맵</p>
                  <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "aspect-square rounded-md border border-white/50 shadow-sm transition-all hover:scale-110 cursor-help",
                          i % 7 === 0 ? "bg-red-500 shadow-red-200 shadow-lg" : i % 5 === 0 ? "bg-amber-400" : "bg-emerald-500"
                        )}
                        title={`매장 ${i + 1}: ${i % 7 === 0 ? "위험" : i % 5 === 0 ? "주의" : "정상"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-4 border-t border-slate-50 pt-4">
                    {[
                      { label: "정상", color: "bg-emerald-500" },
                      { label: "주의", color: "bg-amber-400" },
                      { label: "위험", color: "bg-red-500" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", l.color)} />
                        <span className="text-[10px] font-black text-slate-400 uppercase">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">최근 에스컬레이션 로그</p>
                    <span className="text-[10px] font-bold text-primary">전체 보기</span>
                  </div>
                  <div className="space-y-2">
                    {alerts.length > 0 ? alerts.map((alert) => (
                      <div key={alert.id} className="group flex items-center justify-between rounded-xl border border-[#d5deec] bg-white px-4 py-3.5 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50",
                            alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                          )}>
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-700">{alert.title}</span>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{alert.store_id} · {new Date(alert.detected_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">조치</button>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground p-4 text-center">활성화된 리스크가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 권역별 목표 + 인프라 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#eef3ff] p-2">
                <Map className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">권역별 목표 달성 예보</h2>
            </div>
          </div>
          <div className="space-y-5">
            {regions.map((r) => (
              <div key={r.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground w-12">{r.label}</span>
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      r.pct > 100 ? "bg-emerald-50 text-emerald-600" :
                      r.pct > 80 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>{r.status}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{r.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
                  <div
                    className={cn("h-full transition-all duration-700", r.pct > 100 ? "bg-emerald-500" : r.pct > 80 ? "bg-primary" : "bg-red-500")}
                    style={{ width: `${Math.min(r.pct, 100)}%` }}
                  />
                </div>
                {r.warn && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                    <TriangleAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <p className="text-xs font-medium text-red-600">{r.warn}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#eef3ff] p-2">
                <Server className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">인프라 및 엔진 관제</h2>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <div className="live-point" />
              <span className="text-[10px] font-semibold text-emerald-600">가용률 99.9%</span>
            </div>
          </div>
          <div className="space-y-3">
            {infraNodes.map((node, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3",
                node.status === "경고"
                  ? "border-amber-200 bg-amber-50"
                  : "border-[#d5deec] bg-[#f4f7ff]"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg p-2", node.status === "경고" ? "bg-amber-100" : "bg-[#eef3ff]")}>
                    <node.icon className={cn("h-4 w-4", node.status === "경고" ? "text-amber-600" : "text-primary")} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{node.label}</p>
                    <p className="text-sm font-medium text-foreground">{node.val}</p>
                  </div>
                </div>
                <span className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                  node.status === "경고" ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"
                )}>{node.status}</span>
              </div>
            ))}
            {agentSystemStatus && (
              <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">리소스 헬스</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  최신 매출일 {(agentSystemStatus.resource_health as { latest_sales_date?: string | null } | undefined)?.latest_sales_date ?? "-"}
                </p>
              </div>
            )}
          </div>
          <button className="mt-4 w-full rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
            시스템 로그 보기
          </button>
        </article>
      </div>
    </div>
  );
};
