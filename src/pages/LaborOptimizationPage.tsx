import { useEffect, useState } from "react";
import {
  Users,
  TrendingDown,
  Zap,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Calendar,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailableLabor, getLaborProductivity, getLaborSchedule, getHourlyPattern } from "@/services/labor";
import { getResourceCatalog } from "@/services/data";

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
  { id: "s1", name: "김민준", role: "매니저",  startTime: "09:00", endTime: "18:00", status: "근무중", hoursWorked: 6.5, revenueContrib: 1_820_000 },
  { id: "s2", name: "이서연", role: "주방",    startTime: "10:00", endTime: "19:00", status: "근무중", hoursWorked: 5.5, revenueContrib: 1_540_000 },
  { id: "s3", name: "박지훈", role: "카운터",  startTime: "11:00", endTime: "20:00", status: "근무중", hoursWorked: 4.5, revenueContrib: 1_260_000 },
  { id: "s4", name: "최예린", role: "홀서빙",  startTime: "14:00", endTime: "22:00", status: "대기",   hoursWorked: 1.5, revenueContrib: 420_000  },
];

const hourSlots: HourSlot[] = [
  { hour: "09", revenue: 120_000,  staffCount: 2, recommended: 2, manHourRevenue: 60_000  },
  { hour: "10", revenue: 185_000,  staffCount: 2, recommended: 2, manHourRevenue: 92_500  },
  { hour: "11", revenue: 320_000,  staffCount: 3, recommended: 3, manHourRevenue: 106_667 },
  { hour: "12", revenue: 580_000,  staffCount: 4, recommended: 5, manHourRevenue: 145_000 },
  { hour: "13", revenue: 625_000,  staffCount: 4, recommended: 5, manHourRevenue: 156_250 },
  { hour: "14", revenue: 420_000,  staffCount: 3, recommended: 3, manHourRevenue: 140_000 },
];

const aiRecommendations = [
  {
    level: "warning" as const,
    tag: "Understaffed",
    title: "12~13시 런치 피크 — 1명 추가 배치 권장",
    desc: "예상 객수 대비 홀 인력이 부족하여 서비스 지연 위험이 높습니다. 최예린 사원의 출근을 1시간 앞당기는 것을 추천합니다.",
    impact: "예상 손실액 ₩160,000 방어",
  },
];

export const LaborOptimizationPage = () => {
  const [selectedDate, setSelectedDate]   = useState("2026-03-15");
  const [selectedStore, setSelectedStore] = useState("광화문점");
  const [storeOptions, setStoreOptions] = useState<string[]>(["광화문점"]);
  const [staffRoster, setStaffRoster] = useState(staffList);
  const [productivitySlots, setProductivitySlots] = useState(hourSlots);
  const [availableLabor, setAvailableLabor] = useState<Record<string, unknown> | null>(null);
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
        setStoreOptions(["광화문점"]);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getLaborSchedule({ store_id: selectedStore, date: selectedDate }),
      getLaborProductivity({ store_id: selectedStore, date: selectedDate }),
      getAvailableLabor({ store_id: selectedStore, date: selectedDate }),
    ]).then(([schedule, productivity, available]) => {
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
            revenue: slot.visit_count * 10_000, // 방문 1건 ≈ ₩10,000 (차트 스케일용 추정치)
            staffCount: slot.recommended_staff,
            recommended: slot.recommended_staff,
            manHourRevenue: slot.recommended_staff > 0 ? Math.round((slot.visit_count * 10_000) / slot.recommended_staff) : 0,
          })));
        }).catch(() => { /* fallback 유지 */ });
      }
      setAvailableLabor(available);
    }).catch(() => { /* fallback 유지 */ });
    return () => { alive = false; };
  }, [selectedDate, selectedStore]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Labor Force Management</span>
          </div>
          <h1 className="ds-page-title">인력 리소스 최적화 <span className="text-muted-foreground font-light">|</span> SPLH 분석</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="bg-transparent text-xs font-black focus:outline-none">
              {storeOptions.map((store) => <option key={store} value={store}>{store}</option>)}
            </select>
          </div>
          <div className="ds-glass px-4 py-2 flex items-center gap-3 rounded-xl">
            <Calendar className="h-4 w-4 text-primary" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-xs font-black focus:outline-none" />
          </div>
          <button className="ds-button ds-button-primary h-11">
            <UserPlus className="h-4 w-4 mr-2" />
            Schedule Auto-Gen
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <section className="grid gap-5 md:grid-cols-4">
          {[
          { label: "평균 SPLH", val: `₩${Math.round(productivitySlots.reduce((acc, slot) => acc + slot.manHourRevenue, 0) / Math.max(productivitySlots.length, 1)).toLocaleString()}`, delta: selectedDate, type: "danger", icon: TrendingDown },
          { label: "현재 가용 인력", val: `${availableLabor?.available_count ?? activeStaff}명`, delta: "Live", type: "success", icon: Users },
          { label: "피크 충족률", val: `${Math.round(productivitySlots.reduce((acc, slot) => acc + (slot.staffCount / Math.max(slot.recommended, 1)), 0) / Math.max(productivitySlots.length, 1) * 100)}%`, delta: "Data", type: "warning", icon: Zap },
          { label: "총 근무 인시", val: `${staffRoster.reduce((acc, staff) => acc + staff.hoursWorked, 0).toFixed(1)}h`, delta: selectedStore, type: "success", icon: Clock },
        ].map((kpi, idx) => (
          <article key={idx} className="ds-kpi-card bg-white">
            <div className="flex items-center justify-between">
              <p className="ds-kpi-label">{kpi.label}</p>
              <span className={cn(
                "ds-badge",
                kpi.type === "danger" ? "ds-badge-danger" : kpi.type === "warning" ? "ds-badge-warning" : "ds-badge-success"
              )}>{kpi.delta}</span>
            </div>
            <p className="ds-kpi-value leading-none">{kpi.val}</p>
            <div className="h-10 w-10 rounded-xl bg-panel-soft flex items-center justify-center text-primary mt-2">
              <kpi.icon className="h-5 w-5" />
            </div>
          </article>
        ))}
      </section>

      {/* AI Panel */}
      <section className="ds-ai-panel">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="ds-section-title text-xl">AI 인력 최적화 리포트</h2>
            <p className="text-sm text-muted-foreground font-medium">실시간 트래픽 분석 기반 스케줄 조정 제안</p>
          </div>
        </div>

        <div className="space-y-3">
          {aiRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-5 p-6 bg-white/60 rounded-2xl border border-white/40 group hover:border-primary/20 transition-all">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                rec.level === "warning" ? "bg-amber-50 text-amber-600" : "bg-primary/5 text-primary"
              )}>
                {rec.level === "warning" ? <AlertTriangle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    "ds-badge border-none",
                    rec.level === "warning" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                  )}>{rec.tag}</span>
                  <h4 className="font-black text-foreground">{rec.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{rec.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="ds-eyebrow !text-[9px] mb-1 opacity-60">Impact</p>
                <p className="text-sm font-black text-primary italic uppercase tracking-tighter">{rec.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Productivity Chart */}
        <section className="lg:col-span-8 ds-card flex flex-col">
          <div className="ds-card-header !bg-panel-soft/30">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="ds-section-title">시간대별 생산성 (SPLH)</h3>
            </div>
            <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-muted" /> Labor</span>
            </div>
          </div>
          
          <div className="p-10 flex-1">
            <div className="flex h-64 items-end gap-4 px-2">
              {productivitySlots.map((slot, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full group">
                  <div className="relative w-full flex-1 flex items-end justify-center gap-1">
                    <div className="absolute w-full rounded-t-xl bg-panel-soft/50 transition-all duration-500" style={{ height: `${(slot.staffCount / 6) * 100}%` }} />
                    <div className="relative w-1/2 bg-ai-gradient rounded-t-xl transition-all duration-500 shadow-xl shadow-primary/10 group-hover:scale-x-110" style={{ height: `${(slot.revenue / maxRevenue) * 100}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg z-10 italic">SPLH: ₩{(slot.manHourRevenue/1000).toFixed(0)}k</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground font-mono italic">{slot.hour}h</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Staff Sidebar */}
        <section className="lg:col-span-4 ds-card">
          <div className="ds-card-header">
            <h3 className="ds-section-title text-base">실시간 로스터</h3>
            <button className="ds-button ds-button-ghost !h-9 !w-9 !p-0 rounded-xl"><Search className="h-4 w-4" /></button>
          </div>
          <div className="p-4 space-y-2">
            {staffRoster.map((staff) => (
              <div key={staff.id} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all group hover:border-primary/20",
                staff.status === "근무중" ? "bg-white border-border" : "bg-panel-soft/30 border-transparent opacity-50"
              )}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-2xl bg-panel-soft flex items-center justify-center font-black text-primary text-xs border border-border group-hover:border-primary/30 transition-colors uppercase italic">{staff.name.slice(-2)}</div>
                    {staff.status === "근무중" && <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-success" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground italic leading-none">{staff.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1.5">{staff.role} · {staff.startTime}-{staff.endTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-primary italic leading-none">₩{(staff.revenueContrib/1000).toFixed(0)}k</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase mt-1 italic tracking-widest">{staff.hoursWorked}h Contribution</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-border/50 bg-panel-soft/30">
            <button className="ds-button ds-button-outline w-full !rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] italic">Edit Roster Settings</button>
          </div>
        </section>
      </div>
    </div>
  );
};
