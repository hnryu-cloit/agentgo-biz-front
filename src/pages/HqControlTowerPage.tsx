import type React from "react";
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
  CheckCircle2,
  Clock,
  RotateCcw,
  Database,
  TriangleAlert,
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
  { id: "w4", name: "신규 회원 온보딩 → 웰컴 쿠폰 발송", stage: "실행", status: "completed", store: "전체", duration: "1분 03초", startedAt: "13:10" },
  { id: "w5", name: "공지 OCR → 이행 체크리스트 배포", stage: "실행", status: "completed", store: "전체", duration: "38초", startedAt: "12:45" },
];

type DataQuality = {
  storeId: string;
  name: string;
  score: number;
  sales: boolean;
  cost: boolean;
  customer: boolean;
  review: boolean;
  lastUpdate: string;
};

const dataQualityRows: DataQuality[] = [
  { storeId: "S001", name: "A매장 (강남)", score: 98, sales: true, cost: true, customer: true, review: true, lastUpdate: "오늘 09:00" },
  { storeId: "S002", name: "B매장 (홍대)", score: 74, sales: true, cost: false, customer: true, review: false, lastUpdate: "어제 18:30" },
  { storeId: "S003", name: "C매장 (신촌)", score: 91, sales: true, cost: true, customer: true, review: false, lastUpdate: "오늘 08:50" },
  { storeId: "S004", name: "D매장 (건대)", score: 55, sales: false, cost: false, customer: true, review: false, lastUpdate: "3일 전" },
  { storeId: "S005", name: "E매장 (이태원)", score: 88, sales: true, cost: true, customer: false, review: true, lastUpdate: "오늘 10:15" },
];

type RiskCase = {
  id: string;
  type: "취소급증" | "할인과다" | "포인트누수";
  store: string;
  detail: string;
  level: "P0" | "P1" | "P2";
  status: "open" | "acknowledged" | "resolved";
  detectedAt: string;
};

const riskCases: RiskCase[] = [
  { id: "r1", type: "취소급증", store: "A매장", detail: "전일 대비 취소율 +18%p (5.2% → 23.4%)", level: "P0", status: "open", detectedAt: "오늘 14:12" },
  { id: "r2", type: "할인과다", store: "D매장", detail: "할인 비중 32% 초과 (임계값: 20%)", level: "P1", status: "acknowledged", detectedAt: "오늘 11:40" },
  { id: "r3", type: "포인트누수", store: "B매장", detail: "포인트 사용 대비 발급 비율 이상 (3.1x)", level: "P1", status: "open", detectedAt: "어제 22:05" },
  { id: "r4", type: "취소급증", store: "C매장", detail: "주말 취소율 연속 2주 증가 추세", level: "P2", status: "resolved", detectedAt: "3일 전" },
];

const regions = [
  { label: "수도권", status: "안정적 초과 달성", pct: 112, color: "bg-emerald-500" },
  { label: "충청권", status: "목표 달성 전망", pct: 98, color: "bg-blue-500" },
  { label: "경상권", status: "목표 미달 위험", pct: 85, color: "bg-amber-500" },
  { label: "전라권", status: "심각한 실적 하락", pct: 72, color: "bg-red-500", warn: "AI 제안: 지역 타겟팅 모바일 쿠폰 프로모션 즉각 실행" },
];

const tabClass = (active: boolean) =>
  active
    ? "rounded-lg border border-[#b8ccff] bg-[#eef3ff] px-3 py-2 text-sm font-semibold text-[#2f66ff]"
    : "rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm font-medium text-[#4a5568]";

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
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#2f66ff]">
                본사 통합 관제 시스템
              </span>
              <span className="text-sm text-[var(--subtle-foreground)]">AgentGo Biz HQ Control</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">전국 가맹점 실시간 관제 현황</h2>
            <p className="mt-1 text-base text-muted-foreground">
              AI 기반 위험 감지 및 전국 단위 데이터 분석이 활성화되어 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3 shadow-sm transition-all hover:shadow-md">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef3ff]">
              <Network className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">서버 노드 활성</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">Uptime: 99.98% · Latency: 12ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <article className="app-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">전국 총 매출</p>
            <div className="rounded-lg bg-[#eef3ff] p-1.5">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">42.5억</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+5.2%</span>
            <span className="text-muted-foreground">YoY 기준</span>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">운영 가맹점</p>
            <div className="rounded-lg bg-[#eef3ff] p-1.5">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">248개</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+12개</span>
            <span className="text-muted-foreground">신규 오픈 (월)</span>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">통합 회원 수</p>
            <div className="rounded-lg bg-[#eef3ff] p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">125만명</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">+1.8만명</span>
            <span className="text-muted-foreground">주간 가입</span>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">에스컬레이션 이슈</p>
            <div className="rounded-lg bg-red-50 p-1.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground text-red-600">14건</p>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-medium text-red-600">본사 개입 요망</span>
            <span className="text-muted-foreground">P0 등급 3건</span>
          </div>
        </article>
      </section>

      {/* Agents Tab Section */}
      <section className="app-card p-5 md:p-6">
        <p className="text-sm font-semibold text-primary">에이전트 관제</p>
        <h3 className="mt-1 text-lg font-bold text-foreground">멀티 에이전트 헬스보드</h3>

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
                  <article key={agent.id} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{agent.name}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              agent.health >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            Health {agent.health.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              agent.health >= 90 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${agent.health}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>마지막 실행: {agent.lastRun}</p>
                        <p className="mt-1 font-medium text-[#34415b]">오늘 처리: {agent.dailyTasks}건</p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
          {tab === "workflows" && (
            <div className="space-y-3">
              {workflowRuns.map((wf) => {
                const stageColors: Record<WorkflowRun["stage"], string> = {
                  "분석": "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]",
                  "전략": "border-purple-200 bg-purple-50 text-purple-700",
                  "실행": "border-emerald-200 bg-emerald-50 text-emerald-700",
                };
                const statusInfo: Record<WorkflowRun["status"], { icon: React.ReactNode; label: string; cls: string }> = {
                  completed: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: "완료", cls: "text-emerald-600" },
                  running: { icon: <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />, label: "실행중", cls: "text-primary" },
                  failed: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, label: "실패", cls: "text-red-600" },
                  pending: { icon: <Clock className="h-4 w-4 text-[var(--subtle-foreground)]" />, label: "대기", cls: "text-[var(--subtle-foreground)]" },
                };
                const si = statusInfo[wf.status];
                return (
                  <div key={wf.id} className="flex items-center gap-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${stageColors[wf.stage]}`}>{wf.stage}</span>
                        <p className="text-sm font-medium text-[#1a2138] truncate">{wf.name}</p>
                      </div>
                      <p className="mt-1 text-xs text-[var(--subtle-foreground)]">{wf.store} · {wf.startedAt} 시작{wf.duration && ` · ${wf.duration} 소요`}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${si.cls}`}>
                        {si.icon}
                        {si.label}
                      </div>
                      {wf.status === "failed" && (
                        <button className="flex items-center gap-1 rounded-lg border border-[#d5deec] bg-card px-2.5 py-1.5 text-xs text-[#34415b] transition-colors hover:bg-[#f4f7ff]">
                          <RotateCcw className="h-3 w-3" />재실행
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "data" && (
            <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#f4f7ff] text-[#4a5568]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">매장</th>
                    <th className="px-4 py-3 text-center font-semibold">품질 점수</th>
                    <th className="px-4 py-3 text-center font-semibold">매출</th>
                    <th className="px-4 py-3 text-center font-semibold">원가</th>
                    <th className="px-4 py-3 text-center font-semibold">고객</th>
                    <th className="px-4 py-3 text-center font-semibold">리뷰</th>
                    <th className="px-4 py-3 font-semibold">최근 업데이트</th>
                  </tr>
                </thead>
                <tbody>
                  {dataQualityRows.map((row) => {
                    const scoreColor = row.score >= 90 ? "text-emerald-600" : row.score >= 70 ? "text-amber-600" : "text-red-600";
                    const scoreBg = row.score >= 90 ? "bg-emerald-50" : row.score >= 70 ? "bg-amber-50" : "bg-red-50";
                    const check = (v: boolean) => v
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      : <TriangleAlert className="h-4 w-4 text-red-400 mx-auto" />;
                    return (
                      <tr key={row.storeId} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1a2138]">{row.name}</p>
                          <p className="text-[11px] text-[var(--subtle-foreground)]">{row.storeId}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreBg} ${scoreColor}`}>
                            {row.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{check(row.sales)}</td>
                        <td className="px-4 py-3 text-center">{check(row.cost)}</td>
                        <td className="px-4 py-3 text-center">{check(row.customer)}</td>
                        <td className="px-4 py-3 text-center">{check(row.review)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{row.lastUpdate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {tab === "risk" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {(["취소급증", "할인과다", "포인트누수"] as const).map((type) => {
                  const count = riskCases.filter((r) => r.type === type && r.status !== "resolved").length;
                  const icons: Record<string, React.ReactNode> = {
                    "취소급증": <AlertTriangle className="h-5 w-5 text-red-500" />,
                    "할인과다": <Database className="h-5 w-5 text-amber-500" />,
                    "포인트누수": <ShieldAlert className="h-5 w-5 text-orange-500" />,
                  };
                  return (
                    <div key={type} className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${count > 0 ? "border-red-200 bg-red-50" : "border-[#d5deec] bg-[#f4f7ff]"}`}>
                      <div className="flex items-center gap-2">
                        {icons[type]}
                        <p className="text-sm font-semibold text-[#1a2138]">{type}</p>
                      </div>
                      <p className={`mt-2 text-2xl font-bold ${count > 0 ? "text-red-600" : "text-[var(--subtle-foreground)]"}`}>{count}건</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">미처리 경보</p>
                    </div>
                  );
                })}
              </div>
              <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-[#f4f7ff] text-[#4a5568]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">유형</th>
                      <th className="px-4 py-3 font-semibold">매장</th>
                      <th className="px-4 py-3 font-semibold">내용</th>
                      <th className="px-4 py-3 font-semibold">등급</th>
                      <th className="px-4 py-3 font-semibold">상태</th>
                      <th className="px-4 py-3 font-semibold">탐지 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskCases.map((r) => {
                      const levelColor = r.level === "P0" ? "border-red-200 bg-red-50 text-red-700" : r.level === "P1" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-[#d5deec] bg-[#f4f7ff] text-[#4a5568]";
                      const statusLabel = r.status === "open" ? "미처리" : r.status === "acknowledged" ? "확인됨" : "해결됨";
                      const statusColor = r.status === "open" ? "text-red-600" : r.status === "acknowledged" ? "text-amber-600" : "text-emerald-600";
                      return (
                        <tr key={r.id} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50">
                          <td className="px-4 py-3 font-semibold text-[#1a2138]">{r.type}</td>
                          <td className="px-4 py-3 text-[#4a5568]">{r.store}</td>
                          <td className="px-4 py-3 text-[#4a5568] text-xs">{r.detail}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded border px-2 py-0.5 text-xs font-bold ${levelColor}`}>{r.level}</span>
                          </td>
                          <td className={`px-4 py-3 text-xs font-semibold ${statusColor}`}>{statusLabel}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{r.detectedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Regional + Infra Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Regional Forecast */}
        <article className="app-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-lg bg-indigo-50 p-1.5">
              <Map className="h-5 w-5 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">권역별 AI 매출 예측 모델링</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">전국 권역별 당월 목표 달성 예측치</p>
          <div className="space-y-5">
            {regions.map((r) => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#34415b]">
                    <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-2.5 py-0.5 text-xs font-semibold text-[#2f66ff] shadow-sm">{r.label}</span>
                    <span className="font-medium">{r.status}</span>
                  </span>
                  <span className="font-bold text-foreground">{r.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                  <div className="h-full rounded-full bg-primary shadow-sm" style={{ width: `${Math.min(r.pct, 100)}%` }} />
                </div>
                {r.warn && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 shadow-sm">
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                    {r.warn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>

        {/* Data & Agent Infra */}
        <article className="app-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-foreground">데이터 인프라 및 에이전트 상태</h3>
            <button className="rounded-lg border border-[#d5deec] bg-card px-3 py-1.5 text-xs font-semibold text-[#34415b] transition-colors hover:bg-[#f4f7ff] shadow-sm">
              상세 로그
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">전국 POS 연동 및 AI 추론 서버 상태</p>
          <div className="space-y-3">
            <div className="flex items-start justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">POS 데이터 동기화</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">248/248 매장 정상 수집 중</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">정상</span>
            </div>

            <div className="flex items-start justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI 추론 엔진 로드</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">CPU 42% / GPU 68% 점유율</p>
                </div>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary">양호</span>
            </div>

            <div className="flex items-start justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex gap-3">
                <div className="rounded-lg bg-card p-2 shadow-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">가맹점 발송 자동화 지연</p>
                  <p className="mt-0.5 text-xs text-amber-600 font-medium">알림톡 API 토큰 만료 임박 (D-2)</p>
                </div>
              </div>
              <button className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:opacity-90">
                갱신 필요
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};