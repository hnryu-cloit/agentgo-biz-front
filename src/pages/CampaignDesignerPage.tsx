import type React from "react";
import { useState } from "react";
import { Megaphone, Users, Sparkles, BarChart2, Calculator, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 타입 ──────────────────────────────────────────────────────────────────
type MenuOption = {
  id: string;
  name: string;
  price: number;       // 판매가 (원)
  marginRate: number;  // 마진율 (0~1)
  dailyAvgQty: number; // 일평균 판매 수량
  dailyAvgRevenue: number; // 일평균 매출 (원)
};

// ─── 목업 데이터 ───────────────────────────────────────────────────────────
const segments = [
  { id: "vip",   name: "VIP",     users: "2,341명", rev: "기여 38%", desc: "최근 30일 내 3회 이상 방문" },
  { id: "good",  name: "우수",    users: "8,120명", rev: "기여 44%", desc: "최근 60일 내 방문 이력" },
  { id: "churn", name: "이탈 우려", users: "1,847명", rev: "잠재 18%", desc: "30일 이상 미방문 고객" },
];

const offerPresets = [
  { label: "복귀 할인 쿠폰 10%", roi: "예상 ROI 416%" },
  { label: "무료 음료 증정",     roi: "예상 ROI 280%" },
  { label: "포인트 2배 적립",    roi: "예상 ROI 195%" },
];

const menuOptions: MenuOption[] = [
  { id: "m1", name: "양념치킨 세트",   price: 18_000, marginRate: 0.38, dailyAvgQty: 45,  dailyAvgRevenue: 810_000  },
  { id: "m2", name: "후라이드 세트",   price: 17_000, marginRate: 0.40, dailyAvgQty: 52,  dailyAvgRevenue: 884_000  },
  { id: "m3", name: "반반 세트",       price: 19_000, marginRate: 0.36, dailyAvgQty: 38,  dailyAvgRevenue: 722_000  },
  { id: "m4", name: "맥주 1L",         price: 6_000,  marginRate: 0.65, dailyAvgQty: 80,  dailyAvgRevenue: 480_000  },
  { id: "m5", name: "순살치킨 세트",   price: 20_000, marginRate: 0.35, dailyAvgQty: 29,  dailyAvgRevenue: 580_000  },
];

function fmt(n: number) {
  return n >= 10_000 ? `${(n / 10_000).toFixed(0)}만` : n.toLocaleString();
}

// ─── BEP 계산 로직 ──────────────────────────────────────────────────────────
// 공헌이익/개 = 판매가 × (마진율 - 할인율)
// BEP 수량   = 발송 고정비 / 공헌이익/개
// 필요 증분율 = BEP 수량 / (일평균 × 프로모션 기간)
function calcBep(menu: MenuOption, discountRate: number, fixedCost: number, promoDays: number) {
  const contribPerUnit = menu.price * (menu.marginRate - discountRate);
  if (contribPerUnit <= 0) return null; // 마진 < 할인율 → BEP 불가
  const bepQty = Math.ceil(fixedCost / contribPerUnit);
  const periodExpected = menu.dailyAvgQty * promoDays;
  const incrementRate = bepQty / periodExpected; // 1.0 = 100% (= 일평균만큼 추가 필요)
  return { bepQty, periodExpected, incrementRate, contribPerUnit };
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
export const CampaignDesignerPage: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState("churn");
  const [discount, setDiscount]               = useState(10);
  const [selectedPreset, setSelectedPreset]   = useState(0);
  const [selectedMenuId, setSelectedMenuId]   = useState("m1");
  const [fixedCost, setFixedCost]             = useState(50_000); // 발송 고정비 (원)
  const [promoDays, setPromoDays]             = useState(7);      // 프로모션 기간 (일)

  const selected     = segments.find((s) => s.id === selectedSegment)!;
  const selectedMenu = menuOptions.find((m) => m.id === selectedMenuId)!;
  const discountRate = discount / 100;
  const bep          = calcBep(selectedMenu, discountRate, fixedCost, promoDays);

  // BEP 판정
  const bepJudge = !bep
    ? { label: "계산 불가", sub: "할인율이 마진율을 초과합니다", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: <XCircle className="h-5 w-5" /> }
    : bep.incrementRate <= 0.3
    ? { label: "달성 용이", sub: `일평균 대비 ${(bep.incrementRate * 100).toFixed(0)}% 증분으로 충분`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: <CheckCircle2 className="h-5 w-5" /> }
    : bep.incrementRate <= 0.7
    ? { label: "달성 가능", sub: `일평균 대비 ${(bep.incrementRate * 100).toFixed(0)}% 증분 필요`, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: <AlertTriangle className="h-5 w-5" /> }
    : { label: "달성 어려움", sub: `일평균 대비 ${(bep.incrementRate * 100).toFixed(0)}% 증분 필요`, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: <XCircle className="h-5 w-5" /> };

  return (
    <div className="space-y-6">

      {/* ── 헤더 ── */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">마케팅</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">캠페인 설계</h2>
            <p className="mt-1 text-base text-muted-foreground">
              세그먼트를 선택하고 오퍼를 설계한 뒤 손익분기점을 확인합니다.
            </p>
          </div>
          <div className="rounded-xl bg-[#eef3ff] p-3 shadow-sm">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center gap-0">
          {["세그먼트 선택", "오퍼 설계", "BEP 확인", "승인 요청"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                  idx < 3 ? "bg-primary text-white" : "border border-[#d5deec] bg-card text-[var(--subtle-foreground)]"
                )}>
                  {idx + 1}
                </div>
                <span className={cn("text-xs font-medium", idx < 3 ? "text-primary" : "text-[var(--subtle-foreground)]")}>
                  {step}
                </span>
              </div>
              {idx < 3 && <div className="mx-3 h-px w-8 bg-[#d5deec]" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Step 1 + Step 2 ── */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 1. 세그먼트 선택 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="h-5 w-5 text-[var(--subtle-foreground)]" />
            Step 1. 세그먼트 선택
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">캠페인 대상 고객 그룹을 선택합니다.</p>

          <div className="mt-4 flex-1 space-y-2">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm",
                  selectedSegment === seg.id ? "border-[#b8ccff] bg-[#eef3ff]" : "border-[#d5deec] bg-[#f4f7ff] hover:border-[#bac9e3]"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("font-semibold", selectedSegment === seg.id ? "text-primary" : "text-foreground")}>
                    {seg.name}
                  </p>
                  <span className="text-xs font-medium text-muted-foreground">{seg.rev}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{seg.users} · {seg.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3 shadow-sm">
            <p className="text-xs text-muted-foreground">선택된 세그먼트</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {selected.name} · {selected.users}
            </p>
          </div>
        </article>

        {/* Step 2. 오퍼 설계 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-[var(--subtle-foreground)]" />
            Step 2. 오퍼 설계
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">프로모션 대상 메뉴와 할인 조건을 설정합니다.</p>

          {/* AI 추천 오퍼 */}
          <div className="mt-4 space-y-2">
            {offerPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPreset(idx)}
                className={cn(
                  "w-full rounded-xl border px-4 py-2.5 text-left transition-all hover:shadow-sm",
                  selectedPreset === idx ? "border-[#b8ccff] bg-[#eef3ff]" : "border-[#d5deec] bg-[#f4f7ff] hover:border-[#bac9e3]"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("text-sm font-medium", selectedPreset === idx ? "text-primary" : "text-[#34415b]")}>
                    {preset.label}
                  </p>
                  <span className="text-xs text-muted-foreground">{preset.roi}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 대상 메뉴 선택 */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-[#34415b]">대상 메뉴</label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            >
              {menuOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — 판매가 {m.price.toLocaleString()}원 · 마진 {(m.marginRate * 100).toFixed(0)}% · 일평균 {m.dailyAvgQty}개
                </option>
              ))}
            </select>
          </div>

          {/* 할인율 슬라이더 */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-[#34415b]">할인율</label>
              <span className={cn(
                "rounded border px-2 py-0.5 text-sm font-bold shadow-sm",
                discountRate >= selectedMenu.marginRate
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-[#c9d8ff] bg-[#eef3ff] text-primary"
              )}>
                {discount}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-xs text-[var(--subtle-foreground)]">
              <span>5%</span>
              <span className="text-amber-500">마진율 {(selectedMenu.marginRate * 100).toFixed(0)}%</span>
              <span>30%</span>
            </div>
          </div>

          {/* 발송 메시지 */}
          <div className="mt-4 flex-1">
            <label className="mb-1 block text-sm font-medium text-[#34415b]">발송 메시지</label>
            <textarea
              className="h-20 w-full rounded-xl border border-[#d5deec] bg-card p-3 text-sm text-[#34415b] outline-none transition-colors focus:border-primary/50"
              defaultValue={`고객님, 오랜만에 방문하시면 ${selectedMenu.name} ${discount}% 할인 혜택을 드립니다. (7일 유효)`}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#d5deec] bg-card px-3 py-2.5 text-sm font-medium text-[#34415b] transition-colors hover:bg-[#f4f7ff]">
              테스트 발송
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2356e0]">
              승인 요청
            </button>
          </div>
        </article>
      </section>

      {/* ── Step 3. BEP 손익분기 계산 ── */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Calculator className="h-5 w-5 text-[var(--subtle-foreground)]" />
          Step 3. 손익분기점 (BEP) 확인
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          선택 메뉴의 일평균 실적을 기준으로 프로모션이 수익을 내려면 최소 몇 개를 팔아야 하는지 계산합니다.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {/* 왼쪽: 메뉴 기본 현황 */}
          <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">메뉴 기본 현황</p>
            <div className="space-y-2">
              {[
                { label: "선택 메뉴",     value: selectedMenu.name },
                { label: "판매가",        value: `${selectedMenu.price.toLocaleString()}원` },
                { label: "마진율",        value: `${(selectedMenu.marginRate * 100).toFixed(0)}%` },
                { label: "일평균 판매량", value: `${selectedMenu.dailyAvgQty}개/일` },
                { label: "일평균 매출",   value: `${fmt(selectedMenu.dailyAvgRevenue)}원/일` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold text-[#1a2138]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 가운데: 프로모션 조건 입력 */}
          <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">프로모션 조건</p>
            <div className="space-y-3">
              {/* 할인율 (읽기전용 — Step 2에서 연동) */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">할인율 (Step 2 연동)</label>
                <div className="flex h-9 items-center rounded-lg border border-[#c9d8ff] bg-[#eef3ff] px-3 text-sm font-bold text-primary">
                  {discount}%
                </div>
              </div>
              {/* 프로모션 기간 */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">프로모션 기간</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={promoDays}
                    onChange={(e) => setPromoDays(Math.max(1, Number(e.target.value)))}
                    className="h-9 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-bold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                  />
                  <span className="shrink-0 text-sm text-[var(--subtle-foreground)]">일</span>
                </div>
              </div>
              {/* 발송 고정비 */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">발송 고정비 (문자·앱푸시)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={fixedCost}
                    onChange={(e) => setFixedCost(Math.max(0, Number(e.target.value)))}
                    className="h-9 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-bold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                  />
                  <span className="shrink-0 text-sm text-[var(--subtle-foreground)]">원</span>
                </div>
              </div>
              {/* 개당 공헌이익 */}
              <div className="rounded-lg border border-[#d5deec] bg-card px-3 py-2">
                <p className="text-[10px] text-[var(--subtle-foreground)]">개당 공헌이익 (할인 후)</p>
                <p className={cn(
                  "mt-0.5 text-sm font-black",
                  bep ? "text-[#1a2138]" : "text-red-500"
                )}>
                  {bep
                    ? `${bep.contribPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}원`
                    : "음수 (마진 < 할인율)"}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--subtle-foreground)]">
                  {selectedMenu.price.toLocaleString()}원 × ({(selectedMenu.marginRate * 100).toFixed(0)}% − {discount}%)
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: BEP 결과 */}
          <div className={cn(
            "rounded-xl border p-4 shadow-sm space-y-3",
            bepJudge.border, bepJudge.bg
          )}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">BEP 판정</p>
              <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-black", bepJudge.border, "bg-card", bepJudge.color)}>
                {bepJudge.icon}
                {bepJudge.label}
              </div>
            </div>

            {bep ? (
              <div className="space-y-3">
                {/* BEP 수량 */}
                <div className="rounded-xl border border-white bg-card px-4 py-3 shadow-sm text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">BEP 최소 판매 수량</p>
                  <p className={cn("mt-1 text-4xl font-black", bepJudge.color)}>
                    {bep.bepQty}<span className="ml-1 text-lg font-bold">개</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--subtle-foreground)]">기간 {promoDays}일 내 달성해야 손익 0</p>
                </div>

                {/* 지표 비교 */}
                <div className="space-y-2">
                  {[
                    {
                      label: "기간 내 일평균 예상 판매",
                      value: `${bep.periodExpected}개`,
                      sub: `${selectedMenu.dailyAvgQty}개/일 × ${promoDays}일`,
                      color: "text-[#34415b]",
                    },
                    {
                      label: "BEP 달성 필요 증분",
                      value: `+${Math.max(0, bep.bepQty - bep.periodExpected)}개`,
                      sub: bep.bepQty <= bep.periodExpected
                        ? "일평균만 유지해도 BEP 초과 ✅"
                        : `일평균 대비 ${(bep.incrementRate * 100).toFixed(0)}% 추가 필요`,
                      color: bep.bepQty <= bep.periodExpected ? "text-emerald-600" : bepJudge.color,
                    },
                    {
                      label: "발송 고정비 회수 매출",
                      value: `${fmt(bep.bepQty * selectedMenu.price * (1 - discountRate))}원`,
                      sub: "BEP 판매 수량 × 할인 후 단가",
                      color: "text-[#34415b]",
                    },
                  ].map((row) => (
                    <div key={row.label} className="rounded-lg border border-white bg-card px-3 py-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        <p className={cn("text-sm font-black", row.color)}>{row.value}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[var(--subtle-foreground)]">{row.sub}</p>
                    </div>
                  ))}
                </div>

                {/* 진행 바 */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-muted-foreground">BEP 달성 가능성</span>
                    <span className={cn("font-black", bepJudge.color)}>
                      {Math.min(100, Math.round((bep.periodExpected / bep.bepQty) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-card overflow-hidden border border-[var(--border)]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        bep.incrementRate <= 0.3 ? "bg-emerald-400" :
                        bep.incrementRate <= 0.7 ? "bg-amber-400" : "bg-red-400"
                      )}
                      style={{ width: `${Math.min(100, Math.round((bep.periodExpected / bep.bepQty) * 100))}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-[var(--subtle-foreground)] leading-relaxed">{bepJudge.sub}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <XCircle className="h-10 w-10 text-red-300" />
                <p className="text-sm font-bold text-red-600">BEP 계산 불가</p>
                <p className="text-xs text-muted-foreground">
                  할인율({discount}%)이 마진율({(selectedMenu.marginRate * 100).toFixed(0)}%)을 초과하면<br />
                  판매할수록 손실이 발생합니다.
                </p>
                <p className="text-xs font-semibold text-red-500">
                  할인율을 {(selectedMenu.marginRate * 100 - 1).toFixed(0)}% 이하로 낮추세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 계산식 설명 */}
        <div className="mt-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)] mb-2">BEP 산출 공식</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>개당 공헌이익 = 판매가 × (마진율 − 할인율)</span>
            <span>BEP 수량 = 발송 고정비 ÷ 개당 공헌이익</span>
            <span>달성 가능성 = 기간 내 일평균 예상 ÷ BEP 수량</span>
          </div>
        </div>
      </section>

      {/* ── 예상 성과 요약 ── */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <BarChart2 className="h-5 w-5 text-[var(--subtle-foreground)]" />
          예상 성과 요약
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            { label: "발송 대상",  value: selected.users },
            { label: "예상 오픈율", value: "38.2%" },
            { label: "예상 복귀율", value: "24.0%" },
            { label: "예상 ROI",   value: "416%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3">
          <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-[#4a5568]">
            BEP 달성 시 기간 내 추가 수익{" "}
            <span className="font-black text-primary">
              {bep
                ? `약 ${fmt(Math.max(0, bep.periodExpected - bep.bepQty) * Math.round(bep.contribPerUnit))}원`
                : "계산 불가"}
            </span>
            {" "}예상 · 프로모션 승인 전 BEP 달성 가능성을 반드시 확인하세요.
          </p>
        </div>
      </section>

    </div>
  );
};