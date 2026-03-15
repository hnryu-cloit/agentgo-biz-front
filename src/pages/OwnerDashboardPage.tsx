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
  Phone,
  Clock,
  ParkingCircle,
  UtensilsCrossed,
  FileText,
  CheckCircle2,
  Star,
  AlertTriangle,
  Megaphone,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

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
    impact: "예상 매출 +110,000원",
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
  { label: "어제 매출", value: "870,000원", delta: "-12%", sub: "전주 동요일 대비", down: true, icon: DollarSign },
  { label: "방문 객수", value: "124명", delta: "-18%", sub: "전주 동요일 대비", down: true, icon: Users },
  { label: "평균 객단가", value: "7,016원", delta: "+2.3%", sub: "전주 동요일 대비", down: false, icon: ShoppingBag },
];

const dayCurve = [52, 61, 74, 48, 57, 83, 69];
const avgCurve = [60, 65, 70, 55, 62, 75, 72];

// PQ 분해 데이터
const pqData = [
  { label: "이번 주", sales: 870, qty: 124, unitPrice: 7016 },
  { label: "전주", sales: 989, qty: 151, unitPrice: 6549 },
];

// 마진 경보 메뉴
type MarginAlert = {
  menu: string;
  margin: number;
  target: number;
  cost: number;
  price: number;
  suggestedPrice: number;
  risk: "high" | "medium";
};

const marginAlerts: MarginAlert[] = [
  { menu: "메뉴B (아메리카노)", margin: 18.1, target: 22, cost: 1200, price: 4500, suggestedPrice: 5000, risk: "high" },
  { menu: "메뉴F (카페라떼)", margin: 20.4, target: 22, cost: 1800, price: 5500, suggestedPrice: 5800, risk: "medium" },
  { menu: "메뉴K (샌드위치)", margin: 19.7, target: 24, cost: 3200, price: 6900, suggestedPrice: 7500, risk: "high" },
];

// 리뷰 감성 데이터
const reviewData = {
  positive: ["친절한 직원", "깔끔한 매장", "맛있어요", "커피 맛 좋음", "가성비 좋음"],
  negative: ["대기 시간 길어요", "주차 불편", "가격 비쌈", "양이 적어요"],
  responseGuide: "대기 시간 관련 불만이 가장 많습니다. 피크타임(12~13시) 추가 인력 배치를 권장합니다.",
  total: 284,
  posRate: 71,
};

export const OwnerDashboardPage: React.FC = () => {
  const store = storeResources[0];
  const [proofModal, setProofModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);

  const currentProof = useMemo(() => actions.find((a) => a.id === proofModal) ?? null, [proofModal]);
  const currentConfirm = useMemo(() => actions.find((a) => a.id === confirmModal) ?? null, [confirmModal]);
  const maxCurve = Math.max(...dayCurve, ...avgCurve);
  const maxPQ = Math.max(pqData[0].sales, pqData[1].sales);

  return (
    <>
      <div className="space-y-6">

        {/* Morning Briefing */}
        <section className="rounded-2xl border border-[#b8ccff] bg-[#eef3ff] p-5 md:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">모닝 브리핑</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">오늘 오전 7시 기준 브리핑입니다.</p>
              </div>
            </div>
            <span className="shrink-0 text-xs text-[var(--subtle-foreground)]">2026-03-08 07:00</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#d5deec] bg-card p-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">전일 실적</p>
              <p className="mt-1 text-sm font-bold text-foreground">매출 870,000원 (목표 104%)</p>
              <p className="text-xs text-red-500">객수 -18% · 객단가 +2.3%</p>
            </div>
            <div className="rounded-xl border border-[#d5deec] bg-card p-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">오늘 예측</p>
              <p className="mt-1 text-sm font-bold text-foreground">예상 매출 912,000원</p>
              <p className="text-xs text-emerald-600">비 예보로 배달 주문 +15% 전망</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
              <p className="text-xs font-medium text-amber-700">필수 공지</p>
              <p className="mt-1 text-sm font-bold text-foreground">포장재 입고 수량 확인</p>
              <p className="text-xs text-amber-600">마감: 3월 10일 · 미확인 1건</p>
            </div>
          </div>
        </section>

        {/* Welcome Banner */}
        <section className="app-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#2f66ff]">
                  {store?.name ?? "매장"}
                </span>
                <span className="text-sm text-[var(--subtle-foreground)]">마지막 업데이트: 방금 전</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">오늘도 성공적인 운영을 응원합니다!</h2>
              <p className="mt-1 text-base text-muted-foreground">
                AI 에이전트가 매장 데이터를 실시간으로 모니터링하고 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef3ff]">
                <Bot className="h-5 w-5 text-primary" />
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AgentGo Biz 가동 중</p>
                <p className="text-xs text-muted-foreground">3개의 새로운 제안이 있습니다</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
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
                <p className="mt-3 text-2xl font-bold text-foreground">{kpi.value}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kpi.down ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className={`font-medium ${kpi.down ? "text-red-600" : "text-emerald-600"}`}>{kpi.delta}</span>
                  <span className="text-[var(--subtle-foreground)]">{kpi.sub}</span>
                </div>
              </article>
            );
          })}

          {/* AI 예상 달성률 */}
          <article className="rounded-2xl border border-[#d5deec] bg-[#f4f7ff] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">AI 예상 달성률</p>
              <div className="rounded-lg bg-[#eef3ff] p-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-primary">104%</p>
            <p className="mt-1 text-sm text-muted-foreground">목표 870,000원</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#d5deec]">
              <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
            </div>
          </article>
        </section>

        {/* Action Board */}
        <section className="app-card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">오늘의 운영 액션 보드</h3>
            <span className="ml-auto rounded border border-[#d5deec] bg-[#f4f7ff] px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {done.length}/{actions.length} 완료
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">지금 바로 실행 가능한 우선 액션 3가지입니다.</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#d5deec]">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(done.length / actions.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-3">
            {actions.map((action, idx) => (
              <article
                key={action.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                  done.includes(action.id)
                    ? "border-[#b8ccff] bg-[#eef3ff]"
                    : "border-[#d5deec] bg-[#f4f7ff]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done.includes(action.id)
                      ? "bg-primary text-white"
                      : "border border-[#d5deec] bg-card text-[var(--subtle-foreground)]"
                  }`}>
                    {done.includes(action.id) ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold text-white ${
                        action.level === "P0" ? "bg-red-500" : "bg-amber-500"
                      }`}>
                        {action.level}
                      </span>
                      <p className={`font-semibold ${done.includes(action.id) ? "text-primary line-through" : "text-foreground"}`}>
                        {action.title}
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm text-[#4a5568]">{action.why}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#c9d8ff] bg-card px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary">{action.impact}</span>
                    </div>
                    {!done.includes(action.id) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => setConfirmModal(action.id)}
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2356e0]"
                        >
                          실행
                        </button>
                        <button
                          onClick={() => setProofModal(action.id)}
                          className="rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm text-[#34415b] transition-colors hover:bg-[#f4f7ff]"
                        >
                          근거 보기
                        </button>
                        <button className="rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm text-[#34415b] transition-colors hover:bg-[#f4f7ff]">
                          보류
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 차트 2개 */}
        <section className="grid gap-4 lg:grid-cols-2">

          {/* 시간대별 매출 */}
          <article className="app-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[var(--subtle-foreground)]" />
              <h3 className="text-lg font-bold text-foreground">시간대별 매출 추이</h3>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-[var(--subtle-foreground)]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-primary/80" />오늘
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-[#d5deec]" />평균
              </span>
            </div>
            <div className="mt-4 flex h-44 items-end gap-1.5 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-3 pb-3 pt-4">
              {dayCurve.map((point, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative w-full flex items-end justify-center gap-0.5" style={{ height: "120px" }}>
                    <div
                      className="w-[42%] rounded-t bg-[#d5deec]"
                      style={{ height: `${(avgCurve[idx] / maxCurve) * 100}%` }}
                    />
                    <div
                      className="w-[42%] rounded-t bg-primary/80"
                      style={{ height: `${(point / maxCurve) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--subtle-foreground)]">{idx + 9}시</span>
                </div>
              ))}
            </div>
          </article>

          {/* PQ 분해 차트 */}
          <article className="app-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-[var(--subtle-foreground)]" />
              <h3 className="text-lg font-bold text-foreground">객단가·객수 분해</h3>
            </div>
            <p className="mt-0.5 text-xs text-[var(--subtle-foreground)]">매출 변화를 두 요인으로 분해한 분석입니다</p>
            <div className="mt-4 space-y-4">
              {pqData.map((d) => (
                <div key={d.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#34415b]">{d.label}</span>
                    <span className="text-muted-foreground">{d.sales.toLocaleString()}천원</span>
                  </div>
                  <div className="flex h-8 overflow-hidden rounded-lg">
                    <div
                      className="flex items-center justify-center bg-primary/80 text-[10px] font-bold text-white transition-all"
                      style={{ width: `${(d.qty / (d.qty + d.unitPrice / 1000)) * 100}%` }}
                    >
                      객수
                    </div>
                    <div
                      className="flex items-center justify-center bg-primary/30 text-[10px] font-bold text-primary transition-all"
                      style={{ width: `${(d.unitPrice / 1000 / (d.qty + d.unitPrice / 1000)) * 100}%` }}
                    >
                      객단가
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-[var(--subtle-foreground)]">
                    <span>객수 {d.qty}명</span>
                    <span>객단가 {d.unitPrice.toLocaleString()}원</span>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3 text-xs text-[#4a5568]">
                <span className="font-semibold text-[#1a2138]">해석:</span> 객수 감소(-18%)가 주원인이며, 객단가는 소폭 상승(+2.3%)했습니다. 객수 회복이 우선 과제입니다.
              </div>
            </div>
          </article>
        </section>

        {/* 마진 경보 + 리뷰 감성 */}
        <section className="grid gap-4 lg:grid-cols-2">

          {/* 메뉴 마진 경보 */}
          <article className="app-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-foreground">메뉴 마진 경보</h3>
              <span className="ml-auto rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                위험 {marginAlerts.filter((m) => m.risk === "high").length}건
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">원가 상승으로 마진 하락이 감지된 메뉴입니다.</p>

            <div className="mt-4 space-y-3">
              {marginAlerts.map((alert) => (
                <div
                  key={alert.menu}
                  className={`rounded-xl border p-3 shadow-sm ${
                    alert.risk === "high"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{alert.menu}</p>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                      alert.risk === "high" ? "bg-red-500" : "bg-amber-500"
                    }`}>
                      {alert.risk === "high" ? "위험" : "주의"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[#4a5568]">
                    <span>현재 마진 <strong className="text-red-600">{alert.margin}%</strong></span>
                    <span>목표 {alert.target}%</span>
                    <span className="ml-auto text-primary">권장가 {alert.suggestedPrice.toLocaleString()}원</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      className={`h-full rounded-full ${alert.risk === "high" ? "bg-red-400" : "bg-amber-400"}`}
                      style={{ width: `${(alert.margin / alert.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* 리뷰 감성 요약 */}
          <article className="app-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-bold text-foreground">리뷰 감성 요약</h3>
              <span className="ml-auto text-sm text-muted-foreground">총 {reviewData.total}건</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d5deec]">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${reviewData.posRate}%` }} />
              </div>
              <span className="text-sm font-semibold text-emerald-600">{reviewData.posRate}%</span>
              <span className="text-xs text-[var(--subtle-foreground)]">긍정</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" />긍정 키워드
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reviewData.positive.map((kw) => (
                    <span key={kw} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <TrendingDown className="h-3.5 w-3.5" />부정 키워드
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reviewData.negative.map((kw) => (
                    <span key={kw} className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-600">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3">
              <p className="text-xs font-semibold text-[#34415b]">대응 가이드</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{reviewData.responseGuide}</p>
            </div>
          </article>
        </section>

        {/* 매장 기준 정보 */}
        <article className="app-card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-[var(--subtle-foreground)]" />
            <h3 className="text-lg font-bold text-foreground">매장 기준 정보</h3>
          </div>

          <div className="mt-4 grid gap-2.5 md:grid-cols-2">
            {[
              { icon: Phone, label: "전화", value: store?.phone },
              { icon: Clock, label: "영업시간", value: store?.openHours },
              { icon: Clock, label: "브레이크", value: store?.breakTime },
              { icon: ParkingCircle, label: "주차", value: store?.parking },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-2.5 transition-colors hover:border-[#bac9e3]">
                <div className="rounded-lg bg-[#eef3ff] p-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="w-16 shrink-0 text-xs font-medium text-[var(--subtle-foreground)]">{label}</span>
                <span className="text-sm text-[#34415b]">{value}</span>
              </div>
            ))}
          </div>

          {store?.signatureMenus && (
            <div className="mt-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--subtle-foreground)]">
                <UtensilsCrossed className="h-3.5 w-3.5" />시그니처 메뉴
              </p>
              <div className="flex flex-wrap gap-1.5">
                {store.signatureMenus.map((menu) => (
                  <span key={menu} className="rounded-full border border-[#d5deec] bg-[#f4f7ff] px-2.5 py-1 text-xs text-[#4a5568]">
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          )}

          {store?.menuPdfFile && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-2.5">
              <div className="rounded-lg bg-[#eef3ff] p-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{store.menuPdfFile}</span>
            </div>
          )}
        </article>
      </div>

      {/* 근거 모달 */}
      {currentProof && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-foreground">액션 근거</h4>
              <button
                onClick={() => setProofModal(null)}
                className="rounded border border-border px-2 py-1 text-sm text-[#4a5568]"
              >
                닫기
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1a2138]">{currentProof.title}</p>
            <ul className="mt-3 space-y-2">
              {currentProof.proof.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-[#4a5568]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 실행 확인 모달 */}
      {currentConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h4 className="text-lg font-bold text-foreground">실행 확인</h4>
            <p className="mt-2 text-sm text-muted-foreground">다음 액션을 실행하시겠습니까?</p>
            <p className="mt-3 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3 text-sm font-medium text-[#34415b]">
              {currentConfirm.title}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm text-[#34415b]"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setDone((prev) => (prev.includes(currentConfirm.id) ? prev : [...prev, currentConfirm.id]));
                  setConfirmModal(null);
                }}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                실행
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
