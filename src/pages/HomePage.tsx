import type React from "react";
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
} from "lucide-react";
import { menuPdfStores, storeResources } from "@/data/mockStoreResource";

const quickRoutes = [
  {
    to: "/owner/dashboard",
    title: "점주 홈",
    desc: "오늘 해야 할 핵심 액션 3가지를 바로 확인하고 처리하세요.",
    icon: Store,
    badge: "점주",
  },
  {
    to: "/supervisor/dashboard",
    title: "수퍼바이저",
    desc: "리스크 매장 우선순위로 방문 준비 및 일정 관리를 수행합니다.",
    icon: Users,
    badge: "SV",
  },
  {
    to: "/hq/control-tower",
    title: "본사 관제",
    desc: "에이전트 상태, 워크플로우 및 이슈를 종합적으로 관제합니다.",
    icon: Network,
    badge: "HQ",
  },
  {
    to: "/data/upload",
    title: "데이터 업로드",
    desc: "원천 파일을 업로드하고 처리 상태를 실시간으로 확인합니다.",
    icon: Upload,
    badge: "Data",
  },
];

const kpis = [
  {
    label: "연동된 매장 수",
    value: `${storeResources.length}개`,
    sub: "활성 매장 기준",
    icon: LayoutGrid,
  },
  {
    label: "메뉴 데이터 연동",
    value: `${menuPdfStores.length}개`,
    sub: "매장별 메타데이터 연동",
    icon: FileText,
  },
  {
    label: "기준 날짜",
    value: "2026-03-05",
    sub: "분석·시뮬레이션 기준",
    icon: Calendar,
  },
];

const recentActivity = [
  { time: "14:35", title: "SV 에스컬레이션 발송", desc: "A매장 결제 이상 탐지", done: true },
  { time: "14:23", title: "AI 원인 분석 완료", desc: "이상 패턴 3종 감지", done: true },
  { time: "13:10", title: "쿠폰 캠페인 발송", desc: "이탈 징후 고객 42명 대상", done: false },
  { time: "11:47", title: "데이터 동기화", desc: "248/248 매장 정상 수집", done: true },
];

const agentStatus = [
  { name: "분석 에이전트", health: 98, tasks: 124 },
  { name: "전략 에이전트", health: 85, tasks: 42 },
  { name: "실행 에이전트", health: 92, tasks: 86 },
];

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">

      {/* Welcome Banner */}
      <section className="rounded-2xl border border-border/90 bg-card p-6 md:p-8 shadow-elevated">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">AgentGo Biz</p>
        <h1 className="mt-2 font-title text-3xl leading-tight text-foreground md:text-4xl">
          멀티에이전트 운영 허브
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          점주, 수퍼바이저, 본사 담당자 각 역할별 운영 현황을 한눈에 확인합니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2356e0]"
          >
            점주 대시보드 시작
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/hq/control-tower"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-medium text-[#34415b] transition-colors hover:bg-[#f4f7ff]"
          >
            본사 관제 보기
          </Link>
        </div>
      </section>

      {/* Quick Access */}
      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-[#34415b]">빠른 시작</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickRoutes.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex flex-col gap-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 transition-colors hover:border-[#bac9e3] hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-[#eef3ff] p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded border border-[#d5deec] bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <ArrowRight className="h-4 w-4 text-[#b0bdd4] transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPI Cards */}
      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-[#34415b]">주요 지표 요약</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article key={kpi.label} className="app-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <div className="rounded-lg bg-[#eef3ff] p-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-foreground">{kpi.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{kpi.sub}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom Row: Recent Activity + Agent Status */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* Recent Activity */}
        <article className="app-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-[#34415b]">최근 활동</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d5deec] bg-[#f4f7ff]">
                  <Clock className="h-3.5 w-3.5 text-[var(--subtle-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                      item.done
                        ? "border-[#d5deec] bg-card text-muted-foreground"
                        : "border-[#b8ccff] bg-[#eef3ff] text-primary"
                    }`}>
                      {item.done ? "완료" : "진행중"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--subtle-foreground)]">{item.time} · {item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Agent Status */}
        <article className="app-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-[#34415b]">에이전트 상태</h3>
          </div>
          <div className="space-y-4">
            {agentStatus.map((agent) => (
              <div key={agent.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#34415b]">{agent.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>오늘 {agent.tasks}건</span>
                    <span className="font-semibold text-foreground">{agent.health}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#d5deec]">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${agent.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/hq/control-tower"
            className="mt-5 flex items-center justify-center gap-1.5 rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm font-medium text-[#34415b] transition-colors hover:bg-[#f4f7ff]"
          >
            전체 관제 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

      </section>
    </div>
  );
};