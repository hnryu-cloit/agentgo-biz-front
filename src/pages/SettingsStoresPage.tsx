import type React from "react";
import { useEffect, useState } from "react";
import { Store, CheckCircle2, ChevronDown, FileText, Upload, Trash2, Download, Paperclip } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";
import { getStores, updateStore } from "@/services/settings";

type StoreFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
};

type StoreConfig = {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
  seats: number;
  serviceType: "홀" | "배달" | "테이크아웃" | "전체";
  files: StoreFile[];
  expanded: boolean;
  saved: boolean;
};

const serviceTypes: StoreConfig["serviceType"][] = ["홀", "배달", "테이크아웃", "전체"];

export const SettingsStoresPage: React.FC = () => {
  const [configs, setConfigs] = useState<StoreConfig[]>([]);

  useEffect(() => {
    const fallback = storeResources.map((s, i) => ({
      id: s?.id ?? `s${i}`,
      name: s?.name ?? `매장 ${i + 1}`,
      openTime: "10:00",
      closeTime: "22:00",
      breakStart: "15:00",
      breakEnd: "16:30",
      seats: 42,
      serviceType: "전체" as const,
      files: [
        { id: "f1", name: "2026_여름_메뉴북.pdf", type: "application/pdf", size: "2.4MB", uploadedAt: "2026-03-01" },
        { id: "f2", name: "매장_평면도_v2.jpg", type: "image/jpeg", size: "1.1MB", uploadedAt: "2026-02-15" }
      ],
      expanded: i === 0,
      saved: false,
    }));

    getStores()
      .then((res) => {
        if (res.items.length === 0) { setConfigs(fallback); return; }
        setConfigs(res.items.map((s, i) => ({
          id: s.id,
          name: s.name,
          openTime: s.open_time ?? "10:00",
          closeTime: s.close_time ?? "22:00",
          breakStart: s.break_start ?? "15:00",
          breakEnd: s.break_end ?? "16:30",
          seats: s.seats ?? 42,
          serviceType: (s.service_type as StoreConfig["serviceType"]) ?? "전체",
          files: [],
          expanded: i === 0,
          saved: false,
        })));
      })
      .catch(() => setConfigs(fallback));
  }, []);

  const toggleExpand = (id: string) => {
    setConfigs(configs.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  const updateField = (id: string, field: keyof StoreConfig, value: any) => {
    setConfigs(configs.map(c => c.id === id ? { ...c, [field]: value, saved: false } : c));
  };

  const deleteFile = (storeId: string, fileId: string) => {
    if (confirm("파일을 삭제하시겠습니까?")) {
      setConfigs(configs.map(c => c.id === storeId ? { ...c, files: c.files.filter(f => f.id !== fileId) } : c));
    }
  };

  const saveConfig = (id: string) => {
    const target = configs.find((c) => c.id === id);
    if (!target) return;
    setConfigs(configs.map(c => c.id === id ? { ...c, saved: true } : c));
    updateStore(id, {
      open_time: target.openTime,
      close_time: target.closeTime,
      break_start: target.breakStart,
      break_end: target.breakEnd,
      seats: target.seats,
      service_type: target.serviceType,
    }).finally(() => {
      setTimeout(() => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, saved: false } : c));
      }, 2000);
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="app-card p-5 md:p-6">
        <div>
          <p className="text-sm font-semibold text-primary">설정</p>
          <h2 className="text-2xl font-bold text-foreground">매장 기본 설정</h2>
          <p className="mt-1 text-base text-muted-foreground">매장별 영업 정보 및 메뉴북 등 관련 서류를 통합 관리합니다.</p>
        </div>
      </section>

      {/* Store List */}
      <div className="space-y-4">
        {configs.map((c) => (
          <article key={c.id} className={cn(
            "rounded-2xl border transition-all duration-300 shadow-sm",
            c.expanded ? "border-primary/20 bg-card ring-1 ring-primary/5 shadow-md" : "border-border/90 bg-card hover:border-[#d5deec]"
          )}>
            <button
              onClick={() => toggleExpand(c.id)}
              className="flex w-full items-center justify-between p-5 transition-colors hover:bg-[var(--panel-soft)]/50"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors shadow-sm",
                  c.expanded ? "bg-primary text-white" : "bg-[#eef3ff] text-primary"
                )}>
                  <Store className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-foreground">{c.name}</p>
                  <p className="text-xs font-medium text-[var(--subtle-foreground)] mt-0.5">
                    {c.openTime}~{c.closeTime} · {c.seats}석 · {c.serviceType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[var(--panel-soft)] rounded-full border border-[var(--border)]">
                  <Paperclip className="h-3 w-3 text-[var(--subtle-foreground)]" />
                  <span className="text-[11px] font-bold text-muted-foreground">{c.files.length} Files</span>
                </div>
                <div className={cn(
                  "rounded-full p-1.5 transition-all",
                  c.expanded ? "bg-primary/10 text-primary rotate-180" : "bg-[var(--muted)] text-[var(--subtle-foreground)]"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </button>

            {c.expanded && (
              <div className="border-t border-[var(--border)] bg-card p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid gap-8 lg:grid-cols-12">
                  
                  {/* 기본 정보 설정 */}
                  <div className="lg:col-span-7 space-y-6">
                    <h4 className="text-sm font-bold text-[#1a2138] px-1">기본 운영 정보</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground px-1">영업 시작 시간</label>
                        <input type="time" value={c.openTime} onChange={(e) => updateField(c.id, "openTime", e.target.value)} className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm font-medium text-[#34415b] outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground px-1">영업 종료 시간</label>
                        <input type="time" value={c.closeTime} onChange={(e) => updateField(c.id, "closeTime", e.target.value)} className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm font-medium text-[#34415b] outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground px-1">총 좌석 수</label>
                        <input type="number" value={c.seats} onChange={(e) => updateField(c.id, "seats", Number(e.target.value))} className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm font-medium text-[#34415b] outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground px-1">서비스 운영 유형</label>
                        <select value={c.serviceType} onChange={(e) => updateField(c.id, "serviceType", e.target.value as StoreConfig["serviceType"])} className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm font-medium text-[#34415b] outline-none focus:border-primary/50">
                          {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 파일 관리 섹션 */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-sm font-bold text-[#1a2138]">매장 관련 서류 및 메뉴북</h4>
                      <button className="text-[11px] font-bold text-primary hover:underline">일괄 다운로드</button>
                    </div>
                    
                    <div className="space-y-2">
                      {c.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[#f4f7ff] group transition-all hover:border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-card rounded-lg shadow-sm">
                              <FileText className="h-4 w-4 text-[var(--subtle-foreground)]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#34415b]">{file.name}</p>
                              <p className="text-[10px] text-[var(--subtle-foreground)] mt-0.5">{file.size} · {file.uploadedAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-[var(--subtle-foreground)] hover:text-primary transition-colors">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteFile(c.id, file.id)} className="p-1.5 text-[var(--subtle-foreground)] hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="w-full mt-2 flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-[var(--border)] rounded-2xl bg-card text-[var(--subtle-foreground)] hover:border-primary/30 hover:text-primary hover:bg-primary/[0.02] transition-all group">
                        <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
                        <span className="text-[11px] font-bold">새 파일 등록 (PDF, JPG, PNG)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
                  {c.saved && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4" /> 저장 완료
                    </div>
                  )}
                  <button 
                    onClick={() => saveConfig(c.id)}
                    className="rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#2356e0] transition-all active:scale-95"
                  >
                    설정 저장
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
