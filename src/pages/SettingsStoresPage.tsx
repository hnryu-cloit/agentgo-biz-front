import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Store, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

type StoreConfig = {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
  seats: number;
  serviceType: "홀" | "홀+배달" | "홀+테이크아웃" | "전체";
  expanded: boolean;
  saved: boolean;
};

const initialConfigs: StoreConfig[] = storeResources.slice(0, 5).map((s, i) => ({
  id: `s${i + 1}`,
  name: s?.name ?? `${String.fromCharCode(65 + i)}매장`,
  openTime: "09:00",
  closeTime: "22:00",
  breakStart: "15:00",
  breakEnd: "16:00",
  seats: 20 + i * 5,
  serviceType: i % 2 === 0 ? "홀+배달" : "홀",
  expanded: false,
  saved: false,
}));

export const SettingsStoresPage: React.FC = () => {
  const [configs, setConfigs] = useState(initialConfigs);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)));
  };

  const updateField = <K extends keyof StoreConfig>(id: string, key: K, value: StoreConfig[K]) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value, saved: false } : c)));
  };

  const saveConfig = (id: string) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, saved: true } : c)));
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, saved: false } : c)));
    }, 2000);
  };

  const serviceTypes: StoreConfig["serviceType"][] = ["홀", "홀+배달", "홀+테이크아웃", "전체"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-sm font-semibold text-primary">설정</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">매장 기본 정보 설정</h2>
        <p className="mt-1 text-base text-slate-500">
          영업시간, 좌석 수, 서비스 유형 등 각 매장의 핵심 운영 데이터를 관리합니다.
        </p>
      </section>

      {/* Store List */}
      <div className="space-y-4">
        {configs.map((c) => (
          <article key={c.id} className={cn(
            "rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden",
            c.expanded ? "border-[#CFE0FF] bg-white ring-1 ring-primary/5" : "border-border/90 bg-card"
          )}>
            <button
              onClick={() => toggleExpand(c.id)}
              className="flex w-full items-center justify-between p-5 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors",
                  c.expanded ? "bg-primary text-white" : "bg-[#EEF4FF] text-primary"
                )}>
                  <Store className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-slate-900">{c.name}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {c.openTime}~{c.closeTime} · {c.seats}석 · {c.serviceType}
                  </p>
                </div>
              </div>
              <div className={cn(
                "rounded-full p-1.5 transition-all",
                c.expanded ? "bg-primary/10 text-primary rotate-180" : "bg-slate-100 text-slate-400"
              )}>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {c.expanded && (
              <div className="border-t border-slate-100 bg-[#F8FAFF]/50 px-6 py-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {/* 영업시간 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">영업 시작 시각</label>
                    <input
                      type="time"
                      value={c.openTime}
                      onChange={(e) => updateField(c.id, "openTime", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">영업 종료 시각</label>
                    <input
                      type="time"
                      value={c.closeTime}
                      onChange={(e) => updateField(c.id, "closeTime", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">가용 좌석 수</label>
                    <input
                      type="number"
                      value={c.seats}
                      min={1}
                      max={200}
                      onChange={(e) => updateField(c.id, "seats", Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">브레이크타임 시작</label>
                    <input
                      type="time"
                      value={c.breakStart}
                      onChange={(e) => updateField(c.id, "breakStart", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">브레이크타임 종료</label>
                    <input
                      type="time"
                      value={c.breakEnd}
                      onChange={(e) => updateField(c.id, "breakEnd", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">서비스 운영 유형</label>
                    <select
                      value={c.serviceType}
                      onChange={(e) => updateField(c.id, "serviceType", e.target.value as StoreConfig["serviceType"])}
                      className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      {serviceTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                  {c.saved && (
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black text-emerald-600 shadow-sm animate-in fade-in zoom-in-95">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      SETTING SAVED
                    </div>
                  )}
                  <button
                    onClick={() => saveConfig(c.id)}
                    className="rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    데이터 저장하기
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};