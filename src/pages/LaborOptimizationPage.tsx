import { useState } from "react";
import { Users, TrendingUp, TrendingDown, Zap, Bot, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { storeNames } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

// ─── 타입 ──────────────────────────────────────────────────────────────────
type ShiftStatus = "근무중" | "대기" | "미출근" | "퇴근";

type Staff = {
  id: string;
  name: string;
  role: "홀서빙" | "주방" | "카운터" | "매니저";
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  hoursWorked: number; // 오늘 누적 근무시간
  revenueContrib: number; // 담당 시간대 매출 기여 (원)
};

type HourSlot = {
  hour: string;
  revenue: number;       // 실매출 (원)
  staffCount: number;    // 실투입 인원
  recommended: number;   // AI 권장 인원
  manHourRevenue: number; // 인시당 매출 (원)
};

// ─── 목업 데이터 ───────────────────────────────────────────────────────────
const staffList: Staff[] = [
  { id: "s1", name: "김민준", role: "매니저",  startTime: "09:00", endTime: "18:00", status: "근무중", hoursWorked: 6.5, revenueContrib: 1_820_000 },
  { id: "s2", name: "이서연", role: "주방",    startTime: "10:00", endTime: "19:00", status: "근무중", hoursWorked: 5.5, revenueContrib: 1_540_000 },
  { id: "s3", name: "박지훈", role: "카운터",  startTime: "11:00", endTime: "20:00", status: "근무중", hoursWorked: 4.5, revenueContrib: 1_260_000 },
  { id: "s4", name: "최예린", role: "홀서빙",  startTime: "14:00", endTime: "22:00", status: "대기",   hoursWorked: 1.5, revenueContrib: 420_000  },
  { id: "s5", name: "정현우", role: "주방",    startTime: "08:00", endTime: "16:00", status: "퇴근",   hoursWorked: 8.0, revenueContrib: 2_240_000 },
  { id: "s6", name: "강수아", role: "홀서빙",  startTime: "16:00", endTime: "22:00", status: "미출근", hoursWorked: 0,   revenueContrib: 0         },
];

const hourSlots: HourSlot[] = [
  { hour: "09시", revenue: 120_000,  staffCount: 2, recommended: 2, manHourRevenue: 60_000  },
  { hour: "10시", revenue: 185_000,  staffCount: 2, recommended: 2, manHourRevenue: 92_500  },
  { hour: "11시", revenue: 320_000,  staffCount: 3, recommended: 3, manHourRevenue: 106_667 },
  { hour: "12시", revenue: 580_000,  staffCount: 4, recommended: 5, manHourRevenue: 145_000 },
  { hour: "13시", revenue: 625_000,  staffCount: 4, recommended: 5, manHourRevenue: 156_250 },
  { hour: "14시", revenue: 420_000,  staffCount: 3, recommended: 3, manHourRevenue: 140_000 },
  { hour: "15시", revenue: 275_000,  staffCount: 3, recommended: 2, manHourRevenue: 91_667  },
  { hour: "16시", revenue: 310_000,  staffCount: 3, recommended: 3, manHourRevenue: 103_333 },
  { hour: "17시", revenue: 455_000,  staffCount: 4, recommended: 4, manHourRevenue: 113_750 },
  { hour: "18시", revenue: 520_000,  staffCount: 4, recommended: 4, manHourRevenue: 130_000 },
  { hour: "19시", revenue: 480_000,  staffCount: 4, recommended: 4, manHourRevenue: 120_000 },
  { hour: "20시", revenue: 350_000,  staffCount: 3, recommended: 3, manHourRevenue: 116_667 },
  { hour: "21시", revenue: 200_000,  staffCount: 2, recommended: 2, manHourRevenue: 100_000 },
];

const aiRecommendations = [
  {
    level: "warning" as const,
    title: "12~13시 런치 피크 인력 부족",
    desc: "1인 부족으로 추정 매출 손실 약 160,000원. 최예린 출근 시간을 1시간 앞당기거나 오전 직원 연장 근무를 검토하세요.",
  },
  {
    level: "info" as const,
    title: "15시 슬롯 과잉 배치",
    desc: "권장 2명 대비 3명 투입 중. 인시당 매출 91,667원으로 금일 평균(118,000원) 대비 낮습니다. 1명 조기 휴식 또는 조리 선행 작업 배정을 권장합니다.",
  },
  {
    level: "warning" as const,
    title: "인시당 매출 목표 미달",
    desc: "오늘 현재 평균 인시당 매출 118,000원은 목표(130,000원) 대비 9.2% 하회 중입니다. 피크타임 투입 최적화 시 목표 달성 가능합니다.",
  },
];

const roleBadgeStyle: Record<Staff["role"], string> = {
  매니저:  "border-purple-100 bg-purple-50 text-purple-700",
  주방:    "border-orange-100 bg-orange-50 text-orange-700",
  카운터:  "border-blue-100 bg-blue-50 text-blue-600",
  홀서빙:  "border-teal-100 bg-teal-50 text-teal-700",
};

const statusStyle: Record<ShiftStatus, string> = {
  근무중: "border-emerald-100 bg-emerald-50 text-emerald-700",
  대기:   "border-amber-100 bg-amber-50 text-amber-700",
  미출근: "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)]",
  퇴근:   "border-[var(--border)] bg-card text-[#b0bdd4]",
};

function fmt(n: number) {
  return n >= 10_000 ? `${(n / 10_000).toFixed(0)}만` : n.toLocaleString();
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
export const LaborOptimizationPage = () => {
  const [selectedDate, setSelectedDate] = useState("2026-03-15");
  const [selectedStore, setSelectedStore] = useState("강남역점");

  // KPI 집계
  const totalManHours = staffList.reduce((s, st) => s + st.hoursWorked, 0);
  const avgManHourRevenue = 118_000;
  const targetManHourRevenue = 130_000;
  const activeStaff = staffList.filter((s) => s.status === "근무중").length;
  const peakFulfillmentRate = 82; // %

  const kpiCards = [
    {
      label: "오늘 총 인시",
      value: totalManHours.toFixed(1),
      unit: "h",
      icon: <Clock className="h-5 w-5" />,
      color: "text-[#34415b]",
      bg: "bg-[var(--panel-soft)]",
      border: "border-[var(--border)]",
      sub: `투입 인원 ${staffList.filter(s => s.status !== "미출근").length}명`,
    },
    {
      label: "인시당 매출 (실제)",
      value: `${(avgManHourRevenue / 10000).toFixed(1)}만`,
      unit: "원",
      icon: <TrendingUp className="h-5 w-5" />,
      color: avgManHourRevenue >= targetManHourRevenue ? "text-emerald-600" : "text-red-600",
      bg: avgManHourRevenue >= targetManHourRevenue ? "bg-emerald-50" : "bg-red-50",
      border: avgManHourRevenue >= targetManHourRevenue ? "border-emerald-100" : "border-red-100",
      sub: `목표 ${(targetManHourRevenue / 10000).toFixed(1)}만원 대비 ${((avgManHourRevenue / targetManHourRevenue - 1) * 100).toFixed(1)}%`,
    },
    {
      label: "현재 가용 직원",
      value: activeStaff,
      unit: "명",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      sub: `대기 ${staffList.filter(s => s.status === "대기").length}명 포함 곧 ${staffList.filter(s => s.status === "대기" || s.status === "근무중").length}명`,
    },
    {
      label: "피크 인력 충족율",
      value: peakFulfillmentRate,
      unit: "%",
      icon: peakFulfillmentRate >= 90 ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />,
      color: peakFulfillmentRate >= 90 ? "text-emerald-600" : "text-amber-600",
      bg: peakFulfillmentRate >= 90 ? "bg-emerald-50" : "bg-amber-50",
      border: peakFulfillmentRate >= 90 ? "border-emerald-100" : "border-amber-100",
      sub: "12~13시 런치 피크 기준",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── 헤더 ── */}
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">인력 리소스 최적화</h2>
            <p className="mt-1 text-base text-muted-foreground">
              시간대별 POS 매출과 직원 투입을 비교해 인시당 매출과 최적 인력을 관리합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-semibold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            >
              {storeNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm font-semibold text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </section>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={cn("rounded-2xl border p-5 shadow-elevated", card.border, card.bg)}
          >
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-xl border bg-card", card.border, card.color)}>
              {card.icon}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">{card.label}</p>
            <p className={cn("mt-1 text-3xl font-black", card.color)}>
              {card.value}
              <span className="ml-1 text-base font-bold">{card.unit}</span>
            </p>
            <p className="mt-1 text-[11px] text-[var(--subtle-foreground)]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI 최적화 권고 ── */}
      <section className="rounded-2xl border border-[#c9d8ff] bg-[#f4f7ff] p-5 shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef3ff] border border-[#c9d8ff]">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-[#1a2138]">AI 인력 최적화 권고</span>
          <span className="ml-auto rounded-full border border-[#c9d8ff] bg-card px-2 py-0.5 text-[10px] font-black text-primary">
            {aiRecommendations.length}건
          </span>
        </div>
        <div className="space-y-3">
          {aiRecommendations.map((rec, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm bg-card",
                rec.level === "warning" ? "border-amber-100" : "border-[#c9d8ff]"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                rec.level === "warning" ? "bg-amber-50 border border-amber-100" : "bg-[#eef3ff] border border-[#c9d8ff]"
              )}>
                {rec.level === "warning"
                  ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  : <Zap className="h-3.5 w-3.5 text-primary" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1a2138]">{rec.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#b0bdd4]" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 시간대별 인력/매출 현황 ── */}
      <section className="app-card overflow-hidden">
        <div className="app-section-header">
          <h3 className="text-lg font-bold text-foreground">시간대별 인력 · 인시당 매출</h3>
          <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">Hourly Breakdown</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-20">시간대</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-32">시간대 매출</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-28">투입 / 권장</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">인력 상태</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-36">인시당 매출</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider">목표 대비</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hourSlots.map((slot) => {
                const diff = slot.staffCount - slot.recommended;
                const vsTarget = ((slot.manHourRevenue / targetManHourRevenue) - 1) * 100;
                return (
                  <tr key={slot.hour} className="group transition-all hover:bg-[var(--surface-hover)]/70 font-medium">
                    <td className="pl-8 pr-4 py-3 border-r border-[var(--border)]/40 font-mono font-bold text-[#34415b]">
                      {slot.hour}
                    </td>
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-right font-mono text-[#34415b]">
                      {fmt(slot.revenue)}원
                    </td>
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-center">
                      <span className={cn(
                        "font-mono font-black text-sm",
                        diff < 0 ? "text-red-600" : diff > 0 ? "text-blue-600" : "text-[#34415b]"
                      )}>
                        {slot.staffCount}명
                      </span>
                      <span className="text-[#b0bdd4]"> / </span>
                      <span className="text-xs text-[var(--subtle-foreground)]">{slot.recommended}명</span>
                    </td>
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-center">
                      {diff === 0 ? (
                        <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-600">적정</span>
                      ) : diff < 0 ? (
                        <span className="inline-block rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600">
                          {Math.abs(diff)}명 부족
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-600">
                          {diff}명 초과
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-[var(--border)]/40 text-right font-mono font-bold text-[#1a2138]">
                      {fmt(slot.manHourRevenue)}원
                    </td>
                    <td className="pl-4 pr-8 py-3">
                      <div className="flex items-center gap-2">
                        {/* 바 */}
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              vsTarget >= 0 ? "bg-emerald-400" : vsTarget >= -10 ? "bg-amber-400" : "bg-red-400"
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, (slot.manHourRevenue / targetManHourRevenue) * 100))}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-black font-mono w-14 text-right",
                          vsTarget >= 0 ? "text-emerald-600" : vsTarget >= -10 ? "text-amber-600" : "text-red-600"
                        )}>
                          {vsTarget >= 0 ? "+" : ""}{vsTarget.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-3 bg-[var(--panel-soft)] border-t border-[var(--border)]">
          <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">
            목표 인시당 매출 {(targetManHourRevenue / 10000).toFixed(1)}만원 기준 · 부족 = 매출 기회 손실 / 초과 = 인건비 낭비
          </p>
        </div>
      </section>

      {/* ── 직원 시간표 ── */}
      <section className="app-card overflow-hidden">
        <div className="app-section-header">
          <h3 className="text-lg font-bold text-foreground">직원 시간표 · 기여 현황</h3>
          <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">Today's Roster</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">직원명</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">역할</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-32">근무 시간</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-center w-24">상태</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-28">누적 근무</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 text-right w-36">담당 매출 기여</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider text-right w-36">인시당 매출</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffList.map((staff) => {
                const perHour = staff.hoursWorked > 0
                  ? Math.round(staff.revenueContrib / staff.hoursWorked)
                  : null;
                return (
                  <tr key={staff.id} className={cn(
                    "group transition-all hover:bg-[var(--surface-hover)]/70 font-medium",
                    staff.status === "퇴근" && "opacity-50"
                  )}>
                    <td className="pl-8 pr-4 py-4 border-r border-[var(--border)]/40 font-bold text-[#1a2138]">
                      {staff.name}
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center">
                      <span className={cn(
                        "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black",
                        roleBadgeStyle[staff.role]
                      )}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center font-mono text-xs text-[#4a5568]">
                      {staff.startTime} ~ {staff.endTime}
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-center">
                      <span className={cn(
                        "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black",
                        statusStyle[staff.status]
                      )}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-right font-mono text-[#34415b]">
                      {staff.hoursWorked > 0 ? `${staff.hoursWorked.toFixed(1)}h` : <span className="text-[#b0bdd4]">—</span>}
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-right font-mono text-[#34415b]">
                      {staff.revenueContrib > 0 ? `${fmt(staff.revenueContrib)}원` : <span className="text-[#b0bdd4]">—</span>}
                    </td>
                    <td className="pl-4 pr-8 py-4 text-right">
                      {perHour !== null ? (
                        <span className={cn(
                          "font-mono font-black text-sm",
                          perHour >= targetManHourRevenue ? "text-emerald-600" : perHour >= 100_000 ? "text-amber-600" : "text-red-600"
                        )}>
                          {fmt(perHour)}원/h
                        </span>
                      ) : (
                        <span className="text-[#b0bdd4] text-xs">미출근</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 하단 요약 */}
        <div className="px-8 py-4 bg-card border-t border-[var(--border)] flex flex-wrap items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">총 인시</p>
            <p className="text-lg font-black text-[#1a2138]">{totalManHours.toFixed(1)}<span className="text-xs font-bold ml-0.5">h</span></p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">평균 인시당 매출</p>
            <p className={cn("text-lg font-black", avgManHourRevenue >= targetManHourRevenue ? "text-emerald-600" : "text-red-600")}>
              {fmt(avgManHourRevenue)}<span className="text-xs font-bold ml-0.5">원/h</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">목표 인시당 매출</p>
            <p className="text-lg font-black text-[var(--subtle-foreground)]">{fmt(targetManHourRevenue)}<span className="text-xs font-bold ml-0.5">원/h</span></p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">
              목표 대비 <span className="font-black">-9.2%</span> · 일일 추정 기회손실 약 160,000원
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};