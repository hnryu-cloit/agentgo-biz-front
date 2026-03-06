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

export const OwnerDashboardPage: React.FC = () => {
  const store = storeResources[0];
  const [proofModal, setProofModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);

  const currentProof = useMemo(() => actions.find((a) => a.id === proofModal) ?? null, [proofModal]);
  const currentConfirm = useMemo(() => actions.find((a) => a.id === confirmModal) ?? null, [confirmModal]);
  const maxCurve = Math.max(...dayCurve, ...avgCurve);

  return (
    <>
      <div className="space-y-6">

        {/* Welcome Banner */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs font-semibold text-primary">
                  {store?.name ?? "매장"}
                </span>
                <span className="text-sm text-slate-400">마지막 업데이트: 방금 전</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">오늘도 성공적인 운영을 응원합니다!</h2>
              <p className="mt-1 text-base text-slate-500">
                AI 에이전트가 매장 데이터를 실시간으로 모니터링하고 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
                <Bot className="h-5 w-5 text-primary" />
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">AI 매니저 가동 중</p>
                <p className="text-xs text-slate-500">3개의 새로운 제안이 있습니다</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{kpi.value}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kpi.down ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className={`font-medium ${kpi.down ? "text-red-600" : "text-emerald-600"}`}>{kpi.delta}</span>
                  <span className="text-slate-400">{kpi.sub}</span>
                </div>
              </article>
            );
          })}

          {/* AI 예상 달성률 */}
          <article className="rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">AI 예상 달성률</p>
              <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-primary">104%</p>
            <p className="mt-1 text-sm text-slate-500">목표 870,000원</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
              <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
            </div>
          </article>
        </section>

        {/* Action Board */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">오늘의 운영 액션 보드</h3>
            <span className="ml-auto rounded border border-[#DCE4F3] bg-[#F7FAFF] px-2 py-0.5 text-xs font-medium text-slate-500">
              {done.length}/{actions.length} 완료
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">지금 바로 실행 가능한 우선 액션 3가지입니다.</p>

          {/* 전체 진행바 */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(done.length / actions.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-3">
            {actions.map((action, idx) => (
              <article
                key={action.id}
                className={`rounded-xl border p-4 transition-colors ${
                  done.includes(action.id)
                    ? "border-[#BFD4FF] bg-[#EEF4FF]"
                    : "border-[#DCE4F3] bg-[#F7FAFF]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 번호 */}
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done.includes(action.id)
                      ? "bg-primary text-white"
                      : "border border-[#DCE4F3] bg-white text-slate-400"
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
                      <p className={`font-semibold ${done.includes(action.id) ? "text-primary line-through" : "text-slate-900"}`}>
                        {action.title}
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{action.why}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#DCE4F3] bg-white px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary">{action.impact}</span>
                    </div>
                    {!done.includes(action.id) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => setConfirmModal(action.id)}
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          실행
                        </button>
                        <button
                          onClick={() => setProofModal(action.id)}
                          className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#F8FAFF]"
                        >
                          근거 보기
                        </button>
                        <button className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#F8FAFF]">
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

        {/* 차트 + 매장 정보 */}
        <section className="grid gap-4 lg:grid-cols-2">

          {/* 시간대별 매출 */}
          <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">시간대별 매출 추이</h3>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-primary/80" />오늘
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-[#DCE4F3]" />평균
              </span>
            </div>
            <div className="mt-4 flex h-44 items-end gap-1.5 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-3 pb-3 pt-4">
              {dayCurve.map((point, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative w-full flex items-end justify-center gap-0.5" style={{ height: "120px" }}>
                    <div
                      className="w-[42%] rounded-t bg-[#DCE4F3]"
                      style={{ height: `${(avgCurve[idx] / maxCurve) * 100}%` }}
                    />
                    <div
                      className="w-[42%] rounded-t bg-primary/80"
                      style={{ height: `${(point / maxCurve) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{idx + 9}시</span>
                </div>
              ))}
            </div>
          </article>

          {/* 매장 기준 정보 */}
          <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">매장 기준 정보</h3>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { icon: Phone, label: "전화", value: store?.phone },
                { icon: Clock, label: "영업시간", value: store?.openHours },
                { icon: Clock, label: "브레이크", value: store?.breakTime },
                { icon: ParkingCircle, label: "주차", value: store?.parking },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-2.5">
                  <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="w-16 shrink-0 text-xs font-medium text-slate-400">{label}</span>
                  <span className="text-sm text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            {/* 시그니처 메뉴 */}
            {store?.signatureMenus && (
              <div className="mt-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <UtensilsCrossed className="h-3.5 w-3.5" />시그니처 메뉴
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {store.signatureMenus.map((menu) => (
                    <span key={menu} className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-2.5 py-1 text-xs text-slate-600">
                      {menu}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {store?.menuPdfFile && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-2.5">
                <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs text-slate-500">{store.menuPdfFile}</span>
              </div>
            )}
          </article>

        </section>
      </div>

      {/* 근거 모달 */}
      {currentProof && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">액션 근거</h4>
              <button
                onClick={() => setProofModal(null)}
                className="rounded border border-border px-2 py-1 text-sm text-slate-600"
              >
                닫기
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">{currentProof.title}</p>
            <ul className="mt-3 space-y-2">
              {currentProof.proof.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-slate-600">
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">실행 확인</h4>
            <p className="mt-2 text-sm text-slate-500">다음 액션을 실행하시겠습니까?</p>
            <p className="mt-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3 text-sm font-medium text-slate-700">
              {currentConfirm.title}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700"
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