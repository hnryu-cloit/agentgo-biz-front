import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Store, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">매장 설정</h2>
        <p className="mt-1 text-sm text-slate-500">
          매장별 영업시간·좌석 수·서비스 유형 등 기본 정보를 관리합니다.
        </p>
      </section>

      {/* Store List */}
      <div className="space-y-3">
        {configs.map((c) => (
          <article key={c.id} className="rounded-2xl border border-border/90 bg-card">
            <button
              onClick={() => toggleExpand(c.id)}
              className="flex w-full items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {c.openTime}~{c.closeTime} · {c.seats}석 · {c.serviceType}
                  </p>
                </div>
              </div>
              {c.expanded
                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                : <ChevronDown className="h-4 w-4 text-slate-400" />
              }
            </button>

            {c.expanded && (
              <div className="border-t border-border/60 px-5 pb-5">
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* 영업시간 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">영업 시작</label>
                    <input
                      type="time"
                      value={c.openTime}
                      onChange={(e) => updateField(c.id, "openTime", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">영업 종료</label>
                    <input
                      type="time"
                      value={c.closeTime}
                      onChange={(e) => updateField(c.id, "closeTime", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">좌석 수</label>
                    <input
                      type="number"
                      value={c.seats}
                      min={1}
                      max={200}
                      onChange={(e) => updateField(c.id, "seats", Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">브레이크타임 시작</label>
                    <input
                      type="time"
                      value={c.breakStart}
                      onChange={(e) => updateField(c.id, "breakStart", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">브레이크타임 종료</label>
                    <input
                      type="time"
                      value={c.breakEnd}
                      onChange={(e) => updateField(c.id, "breakEnd", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">서비스 유형</label>
                    <select
                      value={c.serviceType}
                      onChange={(e) => updateField(c.id, "serviceType", e.target.value as StoreConfig["serviceType"])}
                      className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                    >
                      {serviceTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  {c.saved && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      변경 사항이 저장되었습니다.
                    </span>
                  )}
                  <button
                    onClick={() => saveConfig(c.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    저장
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