import type React from "react";
import { useEffect, useState } from "react";
import {
  MapPin, Plus, CheckCircle2, ChevronDown,
  Sparkles, ClipboardCheck, Camera,
  Calendar, Trash2, Send, LayoutGrid,
  Edit3, Save, X, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { getVisitLogs, createVisitLog, getSvStores } from "@/services/supervisor";

type VisitCategory = "운영" | "위생" | "서비스" | "데이터";
type ItemStatus = "pass" | "warn" | "fail";

type ChecklistItem = {
  id: string;
  category: VisitCategory;
  task: string;
  status: ItemStatus;
};

type VisitRecord = {
  id: string;
  store: string;
  visitDate: string;
  supervisor: string;
  aiBriefing: string;
  checklist: ChecklistItem[];
  notes: string;
  ownerFeedback: string;
  followups: { id: string; task: string; deadline: string; done: boolean }[];
  photos?: string[];
  expanded: boolean;
  isEditing: boolean;
};

type StoreOption = {
  id: string;
  name: string;
};

export const SvVisitLogPage: React.FC = () => {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    storeId: "",
    visitDate: new Date().toISOString().split("T")[0],
    notes: "",
    ownerFeedback: "",
    followup: "",
  });

  // API 연결: 방문 기록 로드
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([getVisitLogs(), getSvStores()])
      .then(([res, stores]) => {
        if (!alive) return;
        const options = stores.map((store) => ({ id: store.id, name: store.name }));
        setStoreOptions(options);
        setNewLog((prev) => ({ ...prev, storeId: prev.storeId || options[0]?.id || "" }));
        setVisits(res.map((v) => ({
          id: v.id,
          store: v.store_id,
          visitDate: v.visit_date,
          supervisor: v.supervisor_id,
          aiBriefing: "",
          checklist: [],
          notes: v.summary,
          ownerFeedback: Array.isArray(v.coaching_points) ? v.coaching_points.join(", ") : "",
          followups: [],
          expanded: false,
          isEditing: false,
        })));
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "방문 기록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const toggleExpand = (id: string) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, expanded: !v.expanded } : v)));
  };

  const toggleEdit = (id: string) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, isEditing: !v.isEditing } : v)));
  };

  const updateChecklist = (visitId: string, itemId: string) => {
    const nextStatus: Record<ItemStatus, ItemStatus> = { pass: "warn", warn: "fail", fail: "pass" };
    setVisits((prev) => prev.map((v) => {
      if (v.id !== visitId) return v;
      return {
        ...v,
        checklist: v.checklist.map((c) => c.id === itemId ? { ...c, status: nextStatus[c.status] } : c)
      };
    }));
  };

  const toggleFollowup = (visitId: string, followupId: string) => {
    setVisits((prev) => prev.map((v) => {
      if (v.id !== visitId) return v;
      return {
        ...v,
        followups: v.followups.map((f) => f.id === followupId ? { ...f, done: !f.done } : f)
      };
    }));
  };

  const updateContent = (id: string, field: "notes" | "ownerFeedback", value: string) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const deleteRecord = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleCreate = () => {
    const selectedStore = storeOptions.find((store) => store.id === newLog.storeId);
    const record: VisitRecord = {
      id: `v${Date.now()}`,
      store: selectedStore?.name ?? newLog.storeId,
      visitDate: newLog.visitDate,
      supervisor: "김수진 SV",
      aiBriefing: "방문 전 AI 분석 결과: 크리스탈제이드 실데이터 기준 피크타임 운영과 재방문 전환 액션을 우선 확인해야 합니다.",
      checklist: [
        { id: `nc1-${Date.now()}`, category: "운영", task: "매장 오픈 수칙 준수", status: "pass" },
        { id: `nc2-${Date.now()}`, category: "위생", task: "주방 및 홀 위생 상태", status: "pass" },
        { id: `nc3-${Date.now()}`, category: "서비스", task: "직원 용모 및 친절도", status: "pass" },
      ],
      notes: newLog.notes,
      ownerFeedback: newLog.ownerFeedback,
      followups: newLog.followup ? [
        { id: `nf1-${Date.now()}`, task: newLog.followup, deadline: "차주 중", done: false }
      ] : [],
      expanded: true,
      isEditing: false,
    };
    setVisits([record, ...visits]);
    setShowForm(false);
    setNewLog({ storeId: storeOptions[0]?.id ?? "", visitDate: new Date().toISOString().split("T")[0], notes: "", ownerFeedback: "", followup: "" });

    // API 저장 (실패 시 로컬 상태 유지)
    createVisitLog({
      store_id: newLog.storeId,
      visit_date: newLog.visitDate,
      purpose: "현장 방문",
      summary: newLog.notes,
      issues_found: null,
      coaching_points: newLog.ownerFeedback ? [newLog.ownerFeedback] : null,
      next_visit_date: null,
    }).catch(() => { /* 로컬 상태 유지 */ });
  };

  if (isLoading) {
    return <LoadingState message="방문 기록을 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="방문 기록을 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">현장 코칭</p>
            <h2 className="text-2xl font-bold text-foreground">현장 방문 기록부</h2>
            <p className="mt-1 text-base text-muted-foreground">가맹점 방문 분석 결과와 SV 지도 사항을 체계적으로 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2356e0]"
          >
            <Plus className="h-4 w-4" />
            새 방문 일지 작성
          </button>
        </div>
      </section>

      {/* New Log Form */}
      {showForm && (
        <section className="rounded-2xl border border-border/90 bg-card p-6 shadow-elevated animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">새 방문 기록 작성</h3>
            <button onClick={() => setShowForm(false)} className="text-[var(--subtle-foreground)] hover:text-[#4a5568] transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#34415b] px-1">방문 매장</label>
                <select 
                  value={newLog.storeId}
                  onChange={(e) => setNewLog({ ...newLog, storeId: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] outline-none focus:border-primary/50 transition-all shadow-sm"
                >
                  {storeOptions.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#34415b] px-1">방문 일자</label>
                <input 
                  type="date"
                  value={newLog.visitDate}
                  onChange={(e) => setNewLog({ ...newLog, visitDate: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] outline-none focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#34415b] px-1">현장 점검 상세</label>
              <textarea 
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                placeholder="방문 목적 및 현장 특이사항을 입력하세요..."
                rows={3}
                className="w-full rounded-xl border border-[#d5deec] bg-card px-4 py-3 text-sm text-[#34415b] outline-none focus:border-primary/50 resize-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#34415b] px-1">점주 피드백</label>
              <textarea 
                value={newLog.ownerFeedback}
                onChange={(e) => setNewLog({ ...newLog, ownerFeedback: e.target.value })}
                placeholder="점주 요청 사항이나 면담 내용을 입력하세요..."
                rows={2}
                className="w-full rounded-xl border border-[#d5deec] bg-card px-4 py-3 text-sm text-[#34415b] outline-none focus:border-primary/50 resize-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#34415b] px-1">주요 후속 조치 (Follow-up)</label>
              <input 
                type="text"
                value={newLog.followup}
                onChange={(e) => setNewLog({ ...newLog, followup: e.target.value })}
                placeholder="예) 차주 인력 충원 여부 확인"
                className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-4 text-sm text-[#34415b] outline-none focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-2 border-t border-[var(--border)] pt-6">
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-[#d5deec] bg-card px-6 py-2 text-sm font-medium text-[#4a5568] hover:bg-[#f4f7ff] transition-colors">취소</button>
            <button onClick={handleCreate} className="rounded-lg bg-primary px-8 py-2 text-sm font-bold text-white shadow-md hover:bg-[#2356e0] transition-all active:scale-95">방문 일지 저장하기</button>
          </div>
        </section>
      )}

      {/* Visit Records List */}
      <section className="space-y-4">
        {visits.length === 0 && (
          <EmptyState title="등록된 방문 기록이 없습니다" description="새 방문 일지 작성 버튼으로 첫 기록을 남길 수 있습니다." />
        )}
        {visits.map((v) => (
          <article key={v.id} className={cn(
            "rounded-2xl border transition-all duration-300 shadow-sm",
            v.expanded ? "border-border bg-card ring-1 ring-primary/5 shadow-elevated" : "border-border/90 bg-card hover:border-[#d5deec]"
          )}>
            {/* Summary Row */}
            <div className="flex w-full items-center justify-between p-5">
              <button
                onClick={() => toggleExpand(v.id)}
                className="flex items-center gap-4 text-left flex-1"
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors shadow-sm",
                  v.expanded ? "bg-primary text-white" : "bg-[#eef3ff] text-primary"
                )}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-foreground">{v.store}</p>
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">SV {v.supervisor.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--subtle-foreground)]">
                      <Calendar className="h-3.5 w-3.5" /> {v.visitDate}
                    </span>
                    <div className="flex gap-1.5">
                      {["pass", "warn", "fail"].map(s => {
                        const count = v.checklist.filter(c => c.status === s).length;
                        if (count === 0) return null;
                        return (
                          <span key={s} className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            s === "pass" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            s === "warn" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {s.toUpperCase()} {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => toggleEdit(v.id)}
                  title={v.isEditing ? "저장" : "편집"}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    v.isEditing ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)]"
                  )}
                >
                  {v.isEditing ? <Save className="h-4.5 w-4.5" /> : <Edit3 className="h-4.5 w-4.5" />}
                </button>
                <button 
                  onClick={() => deleteRecord(v.id)}
                  title="삭제"
                  className="p-2 rounded-lg text-[var(--subtle-foreground)] hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button onClick={() => toggleExpand(v.id)} className="p-1.5 text-[#b0bdd4]">
                  <ChevronDown className={cn("h-5 w-5 transition-transform", v.expanded && "rotate-180")} />
                </button>
              </div>
            </div>

            {/* Detailed Content */}
            {v.expanded && (
              <div className="border-t border-border/60 bg-card animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-7 p-6 border-r border-border/60 space-y-6">
                    {/* AI Briefing */}
                    <div className="rounded-xl border border-primary/10 bg-[#f4f7ff] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold text-primary">AI 사전 브리핑</p>
                      </div>
                      <p className="text-sm font-medium text-[#4a5568] leading-relaxed italic">"{v.aiBriefing}"</p>
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#1a2138] px-1">현장 점검 상세</label>
                      {v.isEditing ? (
                        <textarea 
                          value={v.notes}
                          onChange={(e) => updateContent(v.id, "notes", e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-primary/30 bg-card p-4 text-sm text-[#34415b] outline-none focus:border-primary shadow-sm"
                        />
                      ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm min-h-[100px]">
                          <p className="text-sm font-medium text-[#4a5568] leading-relaxed whitespace-pre-wrap">{v.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Owner Feedback */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#1a2138] px-1">점주 피드백</label>
                      {v.isEditing ? (
                        <textarea 
                          value={v.ownerFeedback}
                          onChange={(e) => updateContent(v.id, "ownerFeedback", e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-primary/30 bg-card p-4 text-sm text-[#34415b] outline-none focus:border-primary shadow-sm"
                        />
                      ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm min-h-[80px]">
                          <p className="text-sm font-medium text-[#4a5568] leading-relaxed">{v.ownerFeedback || "입력된 피드백이 없습니다."}</p>
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div className="grid grid-cols-3 gap-3">
                      {v.photos?.map((p, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-[var(--panel-soft)] border border-border flex flex-col items-center justify-center gap-2 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
                          <Camera className="h-5 w-5 text-[var(--subtle-foreground)]" />
                          <span className="text-[10px] font-medium text-muted-foreground px-2 truncate w-full text-center">{p}</span>
                        </div>
                      ))}
                      <div className="aspect-square rounded-xl border-2 border-dashed border-[#d5deec] bg-card flex flex-col items-center justify-center gap-1 text-[var(--subtle-foreground)] hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-bold">사진 추가</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-5 p-6 bg-[#f4f7ff]/50 space-y-6">
                    {/* Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-bold text-[#1a2138]">점검 항목</h4>
                        </div>
                        <span className="text-xs font-bold text-primary bg-[#eef3ff] px-2 py-0.5 rounded-full border border-[#c9d8ff] shadow-sm">
                          SCORE {Math.round((v.checklist.filter(c => c.status === "pass").length / v.checklist.length) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {v.checklist.map((item) => (
                          <button 
                            key={item.id} 
                            onClick={() => updateChecklist(v.id, item.id)}
                            className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-card px-3 py-2 text-sm shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]"
                          >
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              item.status === "pass" ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" :
                              item.status === "warn" ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.5)]"
                            )} />
                            <span className="text-[11px] font-bold text-[var(--subtle-foreground)] w-10 shrink-0 text-left">{item.category}</span>
                            <span className="text-sm font-medium text-[#34415b] flex-1 truncate text-left">{item.task}</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              item.status === "pass" ? "text-emerald-500" :
                              item.status === "warn" ? "text-amber-500" : "text-red-500"
                            )}>{item.status}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <LayoutGrid className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold text-[#1a2138]">후속 조치 계획</h4>
                      </div>
                      <div className="space-y-2.5">
                        {v.followups.map((f) => (
                          <button 
                            key={f.id} 
                            onClick={() => toggleFollowup(v.id, f.id)}
                            className={cn(
                              "w-full text-left rounded-xl border p-3.5 shadow-sm transition-all active:scale-[0.98]",
                              f.done ? "bg-[#f4f7ff] border-emerald-100 opacity-70" : "bg-card border-[var(--border)] hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className={cn("text-sm font-bold", f.done ? "text-[var(--subtle-foreground)] line-through" : "text-[#2f66ff]")}>{f.task}</p>
                              <div className={cn(
                                "h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors",
                                f.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-card border-[var(--border)]"
                              )}>
                                {f.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-[var(--subtle-foreground)]">
                              <span className="uppercase">Due: {f.deadline}</span>
                              <span className={f.done ? "text-emerald-600" : "text-amber-600"}>{f.done ? "COMPLETED" : "PENDING"}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Full-width Footer Action Area */}
                <div className="border-t border-border/60 bg-[var(--panel-soft)]/50 p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--subtle-foreground)] font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    리포트 전송 시 해당 매장 점주 앱으로 실시간 알림이 발송됩니다.
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-10 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2356e0] active:scale-95">
                      <Send className="h-4 w-4" /> 리포트 점주 전송
                    </button>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
