import { useEffect, useState } from "react";
import {
  Users,
  TrendingDown,
  Zap,
  Bot,
  AlertTriangle,
  Clock,
  UserPlus,
  Calendar,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailableLabor, getLaborProductivity, getLaborSchedule, getHourlyPattern } from "@/services/labor";
import { getResourceCatalog } from "@/services/data";
import { getStoreIntelligence, type StoreIntelligence } from "@/services/analysis";

type ShiftStatus = "근무중" | "대기" | "미출근" | "퇴근";
type Staff = {
  id: string;
  name: string;
  role: "홀서빙" | "주방" | "카운터" | "매니저";
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  hoursWorked: number;
  revenueContrib: number;
};
type HourSlot = {
  hour: string;
  revenue: number;
  staffCount: number;
  recommended: number;
  manHourRevenue: number;
};

const staffList: Staff[] = [
  { id: "cj-s1", name: "김민준", role: "매니저", startTime: "10:00", endTime: "19:00", status: "근무중", hoursWorked: 8, revenueContrib: 2_650_000 },
  { id: "cj-s2", name: "이서연", role: "주방", startTime: "10:30", endTime: "20:30", status: "근무중", hoursWorked: 8, revenueContrib: 2_180_000 },
  { id: "cj-s3", name: "박지훈", role: "카운터", startTime: "11:00", endTime: "21:00", status: "근무중", hoursWorked: 8, revenueContrib: 1_940_000 },
  { id: "cj-s4", name: "최예린", role: "홀서빙", startTime: "11:30", endTime: "21:30", status: "대기", hoursWorked: 8, revenueContrib: 1_720_000 },
];

const hourSlots: HourSlot[] = [
  { hour: "11", revenue: 2_570_000, staffCount: 4, recommended: 4, manHourRevenue: 642_500 },
  { hour: "12", revenue: 12_800_000, staffCount: 4, recommended: 4, manHourRevenue: 3_200_000 },
  { hour: "13", revenue: 14_520_000, staffCount: 4, recommended: 4, manHourRevenue: 3_630_000 },
  { hour: "14", revenue: 8_060_000, staffCount: 4, recommended: 4, manHourRevenue: 2_015_000 },
  { hour: "18", revenue: 8_380_000, staffCount: 4, recommended: 4, manHourRevenue: 2_095_000 },
  { hour: "19", revenue: 11_140_000, staffCount: 4, recommended: 4, manHourRevenue: 2_785_000 },
];

const aiRecommendations = [
  {
    level: "warning" as const,
    tag: "크리스탈제이드 피크",
    title: "12~14시, 18~19시 방문 급증",
    desc: "도도포인트 실데이터 기준으로 12시 1,280건, 13시 1,452건, 19시 1,114건 방문이 집중됩니다. 런치와 디너 모두 4인 이상 운영을 유지하는 편이 맞습니다.",
    impact: "피크 서비스 지연 방어",
  },
];

export const LaborOptimizationPage = () => {
  const [selectedDate, setSelectedDate]   = useState("2026-03-15");
  const [selectedStore, setSelectedStore] = useState("크리스탈제이드");
  const [storeOptions, setStoreOptions] = useState<string[]>(["크리스탈제이드"]);
  const [staffRoster, setStaffRoster] = useState(staffList);
  const [productivitySlots, setProductivitySlots] = useState(hourSlots);
  const [availableLabor, setAvailableLabor] = useState<Record<string, unknown> | null>(null);
  const [storeIntelligence, setStoreIntelligence] = useState<StoreIntelligence | null>(null);
  const activeStaff = staffRoster.filter((s) => s.status === "근무중").length;
  const maxRevenue = Math.max(...productivitySlots.map(s => s.revenue));

  useEffect(() => {
    let alive = true;
    getResourceCatalog()
      .then((catalog) => {
        if (!alive) return;
        const posStores = catalog.sources.find((s) => s.source_kind === "receipt_listing")?.stores.map((s) => s.store_key) ?? [];
        const dodoStores = catalog.sources.find((s) => s.source_kind === "dodo_point")?.stores.map((s) => s.store_key) ?? [];
        const stores = [...new Set([...posStores, ...dodoStores])];
        if (stores.length === 0) return;
        setStoreOptions(stores);
        setSelectedStore((current) => (stores.includes(current) ? current : stores[0]));
      })
      .catch(() => {
        if (!alive) return;
        setStoreOptions(["크리스탈제이드"]);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getLaborSchedule({ store_id: selectedStore, date: selectedDate }),
      getLaborProductivity({ store_id: selectedStore, date: selectedDate }),
      getAvailableLabor({ store_id: selectedStore, date: selectedDate }),
      getStoreIntelligence(selectedStore).catch(() => null),
    ]).then(([schedule, productivity, available, intelligence]) => {
      if (!alive) return;
      if (schedule.length > 0) {
        setStaffRoster(schedule.map((entry) => ({
          id: String(entry.id),
          name: entry.employee_name,
          role: (["홀서빙", "주방", "카운터", "매니저"].includes(entry.role) ? entry.role : "주방") as Staff["role"],
          startTime: entry.start_time.slice(11, 16),
          endTime: entry.end_time.slice(11, 16),
          status: entry.status === "actual" ? "근무중" : entry.status === "scheduled" ? "대기" : "미출근",
          hoursWorked: Math.max(1, Number(((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 3600000).toFixed(1))),
          revenueContrib: 0,
        })));
      }
      if (productivity.length > 0) {
        setProductivitySlots(productivity.map((slot) => ({
          hour: String(slot.hour).padStart(2, "0"),
          revenue: Math.round(slot.sales_per_labor_hour * slot.recommended_staff),
          staffCount: Math.max(1, Math.round(slot.recommended_staff * slot.attainment_rate)),
          recommended: slot.recommended_staff,
          manHourRevenue: Math.round(slot.sales_per_labor_hour),
        })));
      } else {
        // POS 데이터 없는 매장(예: 크리스탈제이드) → 도도포인트 시간대별 방문 패턴으로 fallback
        getHourlyPattern(selectedStore).then((pattern) => {
          if (!alive) return;
          const activeSlots = pattern.hourly_pattern.filter((slot) => slot.visit_count > 0);
          if (activeSlots.length === 0) return;
          setProductivitySlots(activeSlots.map((slot) => ({
            hour: String(slot.hour).padStart(2, "0"),
            revenue: slot.visit_count * 10_000,
            staffCount: slot.recommended_staff,
            recommended: slot.recommended_staff,
            manHourRevenue: slot.recommended_staff > 0 ? Math.round((slot.visit_count * 10_000) / slot.recommended_staff) : 0,
          })));
        }).catch(() => { /* fallback 유지 */ });
      }
      setAvailableLabor(available);
      setStoreIntelligence(intelligence);
    }).catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, [selectedDate, selectedStore]);

  const recommendationCards = storeIntelligence && storeIntelligence.staffing.length > 0
    ? storeIntelligence.staffing.map((item) => ({
        level: item.status === "understaffed" ? "warning" as const : "info" as const,
        tag: `${item.evidence[1]?.period ?? "시간대"} 운영`,
        title: item.status === "understaffed" ? `${Math.abs(item.gap)}명 추가 투입 권고` : item.status === "overstaffed" ? `${Math.abs(item.gap)}명 재배치 검토` : "현재 인력 적정",
        desc: item.recommendation,
        impact: `기회비용 ${item.opportunity_cost.toLocaleString()}원`,
      }))
    : aiRecommendations;

  return (
    <div className="space-y-6 pb-10">

      {/* 페이지 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">인력 최적화</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">인력 리소스 최적화</h2>
            <p className="mt-1 text-sm text-slate-500">시간대별 인시당 매출(SPLH) 분석 및 스케줄 최적화를 수행합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-white px-3 py-2">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                {storeOptions.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#DCE4F3] bg-white px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9]">
              <UserPlus className="h-4 w-4" />
              스케줄 자동 생성
            </button>
          </div>
        </div>
      </section>

      {/* KPI 요약 */}
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "평균 SPLH", val: `₩${Math.round(productivitySlots.reduce((acc, slot) => acc + slot.manHourRevenue, 0) / Math.max(productivitySlots.length, 1)).toLocaleString()}`, sub: selectedDate, icon: TrendingDown, color: "text-red-500" },
          { label: "가용 인력", val: `${availableLabor?.available_count ?? activeStaff}명`, sub: "현재 근무중", icon: Users, color: "text-emerald-600" },
          { label: "피크 충족률", val: `${Math.round(productivitySlots.reduce((acc, slot) => acc + (slot.staffCount / Math.max(slot.recommended, 1)), 0) / Math.max(productivitySlots.length, 1) * 100)}%`, sub: "권장 대비", icon: Zap, color: "text-amber-500" },
          { label: "총 근무 인시", val: `${staffRoster.reduce((acc, staff) => acc + staff.hoursWorked, 0).toFixed(1)}h`, sub: selectedStore, icon: Clock, color: "text-primary" },
        ].map((kpi, idx) => (
          <article key={idx} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{kpi.val}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
          </article>
        ))}
      </section>

      {/* AI 인력 권고 */}
      <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI 인력 권고</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">실시간 트래픽 분석 기반 스케줄 조정 제안</p>
          </div>
        </div>

        <div className="space-y-2">
          {recommendationCards.map((rec, i) => (
            <div key={i} className="rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  rec.level === "warning" ? "bg-amber-50" : "bg-[#EEF4FF]"
                )}>
                  {rec.level === "warning"
                    ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                    : <Zap className="h-4 w-4 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                      rec.level === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-[#BFD4FF] bg-[#EEF4FF] text-primary"
                    )}>{rec.tag}</span>
                    <p className="text-sm font-bold text-slate-900">{rec.title}</p>
                  </div>
                  <p className="text-xs text-slate-500">{rec.desc}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-primary">{rec.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 시간대별 생산성 차트 */}
        <section className="lg:col-span-8 rounded-2xl border border-border/90 bg-card p-5 shadow-elevated md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-700">시간대별 생산성 (SPLH)</h3>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-primary" /> 매출</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> 권장인원</span>
            </div>
          </div>
          <div className="flex h-44 items-end gap-2 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-3 pb-3 pt-4">
            {productivitySlots.map((slot, idx) => {
              const under = slot.staffCount < slot.recommended;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1 group">
                  <div className="flex w-full items-end justify-center gap-0.5" style={{ height: "100%" }}>
                    {/* 권장 인원 바 (회색) */}
                    <div
                      className="w-2 rounded-t bg-gray-300"
                      style={{ height: `${(slot.recommended / 6) * 100}%` }}
                    />
                    {/* 매출 바 (primary, 부족 시 amber) */}
                    <div
                      className={cn("w-3 rounded-t transition-opacity group-hover:opacity-70", under ? "bg-amber-400" : "bg-primary/80")}
                      style={{ height: `${(slot.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{slot.hour}시</span>
                </div>
              );
            })}
          </div>
          {/* 하단 범례 보조 */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> 인력 부족 시간대</span>
            <span>SPLH = 시간당 매출 / 투입 인원</span>
          </div>
        </section>

        {/* 실시간 로스터 */}
        <section className="lg:col-span-4 rounded-2xl border border-border/90 bg-card shadow-elevated">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-700">실시간 로스터</h3>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DCE4F3] bg-white text-slate-400 hover:text-slate-600">
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {staffRoster.map((staff) => (
              <div
                key={staff.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 transition-colors",
                  staff.status === "근무중" ? "border-[#DCE4F3] bg-white" : "border-transparent bg-gray-50 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF] text-xs font-bold text-primary">
                      {staff.name.slice(-2)}
                    </div>
                    {staff.status === "근무중" && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{staff.name}</p>
                    <p className="text-[10px] text-slate-400">{staff.role} · {staff.startTime}–{staff.endTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary">₩{(staff.revenueContrib / 1000).toFixed(0)}k</p>
                  <p className="text-[10px] text-slate-400">{staff.hoursWorked}h</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 p-4">
            <button className="w-full rounded-xl border border-[#DCE4F3] bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-gray-50">
              로스터 설정
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
