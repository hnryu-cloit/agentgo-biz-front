import { useEffect, useState } from "react";
import {
  Network,
  Building2,
  Users,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Map,
  Server,
  AlertTriangle,
} from "lucide-react";

type TabKey = "agents" | "workflows" | "data" | "risk";

type Agent = {
  id: string;
  name: string;
  health: number;
  lastRun: string;
  dailyTasks: number;
  status: "정상" | "주의" | "장애";
};

const initialAgents: Agent[] = [
  { id: "a1", name: "분석 에이전트", health: 98, lastRun: "2분 전", dailyTasks: 124, status: "정상" },
  { id: "a2", name: "전략 에이전트", health: 85, lastRun: "15분 전", dailyTasks: 42, status: "주의" },
  { id: "a3", name: "실행 에이전트", health: 92, lastRun: "1분 전", dailyTasks: 86, status: "정상" },
  { id: "a4", name: "OCR 에이전트", health: 78, lastRun: "45분 전", dailyTasks: 21, status: "주의" },
  { id: "a5", name: "리포트 에이전트", health: 100, lastRun: "10분 전", dailyTasks: 15, status: "정상" },
];

const regions = [
  { label: "수도권", status: "안정적 초과 달성", pct: 112, color: "bg-emerald-500" },
  { label: "충청권", status: "목표 달성 전망", pct: 98, color: "bg-blue-500" },
  { label: "경상권", status: "목표 미달 위험", pct: 85, color: "bg-amber-500" },
  { label: "전라권", status: "심각한 실적 하락", pct: 72, color: "bg-red-500", warn: "AI 제안: 지역 타겟팅 모바일 쿠폰 프로모션 즉각 실행" },
];

const tabClass = (active: boolean) =>
  active
    ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-[#2454C8]"
    : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-medium text-slate-600";

export const HqControlTowerPage = () => {
  const [tab, setTab] = useState<TabKey>("agents");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          health: Math.min(100, Math.max(0, a.health + (Math.random() * 4 - 2))),
        }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs font-semibold text-primary">
                본사 통합 관제 시스템
              </span>
              <span className="text-sm text-slate-400">AgentGo Biz HQ Control</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">전국 가맹점 실시간 관제 현황</h2>
            <p className="mt-1 text-base text-slate-500">
              AI 기반 위험 감지 및 전국 단위 데이터 분석이 활성화되어 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
              <Network className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">서버 노드 활성</p>
              <p className="mt-0.5 font-mono text-xs text-slate-500">Uptime: 99.98% · Latency: 12ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">전국 총 매출</p>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">42.5억</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+5.2%</span>
            <span className="text-slate-500">YoY 기준</span>
          </div>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">운영 가맹점</p>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">248개</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+12개</span>
            <span className="text-slate-500">신규 오픈 (월)</span>
          </div>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">통합 회원 수</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">125만명</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+1.8만명</span>
            <span className="text-slate-500">주간 가입</span>
          </div>
        </article>

        <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">에스컬레이션 이슈</p>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">14건</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-medium text-red-600">본사 개입 요망</span>
            <span className="text-slate-500">P0 등급 3건</span>
          </div>
        </article>
      </section>

      {/* Agents Tab Section */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <p className="text-sm font-semibold text-brand-300">에이전트 관제</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">멀티 에이전트 헬스보드</h3>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <button className={tabClass(tab === "agents")} onClick={() => setTab("agents")}>에이전트</button>
          <button className={tabClass(tab === "workflows")} onClick={() => setTab("workflows")}>워크플로우</button>
          <button className={tabClass(tab === "data")} onClick={() => setTab("data")}>데이터 품질</button>
          <button className={tabClass(tab === "risk")} onClick={() => setTab("risk")}>리스크</button>
        </div>

        <div className="mt-6">
          {tab === "agents" && (
            <div className="space-y-4">
              {agents
                .sort((a, b) => (a.status === "주의" ? -1 : 1))
                .map((agent) => (
                  <article key={agent.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              agent.health >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            Health {agent.health.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              agent.health >= 90 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${agent.health}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>마지막 실행: {agent.lastRun}</p>
                        <p className="mt-1 font-medium text-slate-700">오늘 처리: {agent.dailyTasks}건</p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
          {tab !== "agents" && (
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 text-sm text-slate-700">
              {tab} 탭 상세 내용은 준비 중입니다.
            </div>
          )}
        </div>
      </section>

      {/* Regional + Infra Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Regional Forecast */}
        <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <Map className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">권역별 AI 매출 예측 모델링</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">전국 권역별 당월 목표 달성 예측치</p>
          <div className="space-y-5">
            {regions.map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="rounded border border-[#DCE4F3] bg-[#F7FAFF] px-2 py-0.5 text-xs text-slate-600">{r.label}</span>
                    {r.status}
                  </span>
                  <span className="font-semibold text-slate-900">{r.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(r.pct, 100)}%` }} />
                </div>
                {r.warn && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {r.warn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>

        {/* Data & Agent Infra */}
        <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900">데이터 인프라 및 에이전트 상태</h3>
            <button className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F8FAFF]">
              상세 로그
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-5">전국 POS 연동 및 AI 추론 서버 상태</p>
          <div className="space-y-3">
            <div className="flex items-start justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#EEF4FF] p-2">
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">POS 데이터 동기화</p>
                  <p className="mt-0.5 text-xs text-slate-500">248/248 매장 정상 수집 중</p>
                </div>
              </div>
              <span className="rounded border border-[#DCE4F3] bg-white px-2 py-1 text-xs font-medium text-slate-700">정상</span>
            </div>

            <div className="flex items-start justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#EEF4FF] p-2">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI 추론 엔진 로드</p>
                  <p className="mt-0.5 text-xs text-slate-500">CPU 42% / GPU 68% 점유율</p>
                </div>
              </div>
              <span className="rounded border border-[#DCE4F3] bg-white px-2 py-1 text-xs font-medium text-slate-700">양호</span>
            </div>

            <div className="flex items-start justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#EEF4FF] p-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">가맹점 발송 자동화 지연</p>
                  <p className="mt-0.5 text-xs text-slate-500">알림톡 API 토큰 만료 임박 (D-2)</p>
                </div>
              </div>
              <button className="rounded-lg border border-[#D6E0F0] bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#F8FAFF]">
                갱신 필요
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};