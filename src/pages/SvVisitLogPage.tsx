import type React from "react";
import { useState } from "react";
import { 
  MapPin, Plus, CheckCircle2, ChevronDown, 
  Sparkles, ClipboardCheck, MessageSquare, Camera, 
  User, Calendar, Trash2, Send, LayoutGrid,
  Edit3, Save, X, AlertCircle
} from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

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

const storeNames = storeResources.slice(0, 5).map((s, i) => s?.name ?? `${String.fromCharCode(65 + i)}매장`);

const initialVisits: VisitRecord[] = [
  {
    id: "v1",
    store: storeNames[0],
    visitDate: "2026-03-07",
    supervisor: "김수진 SV",
    aiBriefing: "최근 2주간 12시~13시 피크타임 취소율이 평균 대비 15% 높음. 인력 배치 및 주방 동선 확인 필요.",
    checklist: [
      { id: "c1", category: "운영", task: "피크타임 인력 배치 적정성", status: "warn" },
      { id: "c2", category: "위생", task: "식자재 보관함 라벨링 상태", status: "pass" },
      { id: "c3", category: "서비스", task: "고객 인사 및 응대 태도", status: "pass" },
      { id: "c4", category: "데이터", task: "POS 메뉴 품절 연동 상태", status: "fail" },
    ],
    notes: "AI 분석대로 점심 피크 시 주방 인원이 부족하여 주문 지연이 발생함. 배달 주문 접수 일시 중지가 잦은 상태임.",
    ownerFeedback: "점주님께서 파트타임 구인이 어려워 직접 주방을 지원 중이나 체력적 한계 호소. 차주 채용 공고 지원하기로 함.",
    followups: [
      { id: "f1", task: "주방 보조 파트타임 1명 추가 채용 지원", deadline: "03-15", done: false },
      { id: "f2", task: "배달 플랫폼 영업 임시 조정 가이드", deadline: "03-10", done: true },
    ],
    photos: ["현장사진_주방.jpg", "메뉴판_오타.png"],
    expanded: true,
    isEditing: false,
  },
  {
    id: "v2",
    store: storeNames[1],
    visitDate: "2026-02-28",
    supervisor: "박재원 SV",
    aiBriefing: "매출은 안정적이나 객단가가 구역 평균 대비 12% 낮음. 세트 메뉴 추천 및 업셀링 교육 강화 요망.",
    checklist: [
      { id: "c5", category: "운영", task: "오픈/마감 시간 준수 여부", status: "pass" },
      { id: "c6", category: "위생", task: "테이블 및 바닥 청결 상태", status: "pass" },
      { id: "c7", category: "서비스", task: "업셀링 스크립트 활용 여부", status: "warn" },
    ],
    notes: "전반적으로 우수하나 신규 직원의 경우 업셀링 제안이 어색함. 매장 내 홍보물 위치가 고객 눈에 띄지 않음.",
    ownerFeedback: "객단가 상승을 위한 신메뉴 포스터 추가 지원 요청.",
    followups: [
      { id: "f3", task: "A형 홍보 보드 2개 지원", deadline: "03-05", done: true },
    ],
    expanded: false,
    isEditing: false,
  }
];

export const SvVisitLogPage: React.FC = () => {
  const [visits, setVisits] = useState(initialVisits);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    store: storeNames[0],
    visitDate: new Date().toISOString().split("T")[0],
    notes: "",
    ownerFeedback: "",
    followup: "",
  });

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
    const record: VisitRecord = {
      id: `v${Date.now()}`,
      store: newLog.store,
      visitDate: newLog.visitDate,
      supervisor: "김수진 SV",
      aiBriefing: "방문 전 AI 분석 결과: 최근 매출 추이는 안정적이나, 피크타임 운영 효율화가 필요한 지점이 감지됩니다.",
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
    setNewLog({ store: storeNames[0], visitDate: new Date().toISOString().split("T")[0], notes: "", ownerFeedback: "", followup: "" });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">현장 코칭</p>
            <h2 className="text-2xl font-bold text-slate-900">현장 방문 기록부</h2>
            <p className="mt-1 text-base text-slate-500">가맹점 방문 분석 결과와 SV 지도 사항을 체계적으로 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E5BE9]"
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
            <h3 className="text-lg font-bold text-slate-900">새 방문 기록 작성</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 px-1">방문 매장</label>
                <select 
                  value={newLog.store}
                  onChange={(e) => setNewLog({ ...newLog, store: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary/50 transition-all shadow-sm"
                >
                  {storeNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 px-1">방문 일자</label>
                <input 
                  type="date"
                  value={newLog.visitDate}
                  onChange={(e) => setNewLog({ ...newLog, visitDate: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">현장 점검 상세</label>
              <textarea 
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                placeholder="방문 목적 및 현장 특이사항을 입력하세요..."
                rows={3}
                className="w-full rounded-xl border border-[#D6E0F0] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary/50 resize-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">점주 피드백</label>
              <textarea 
                value={newLog.ownerFeedback}
                onChange={(e) => setNewLog({ ...newLog, ownerFeedback: e.target.value })}
                placeholder="점주 요청 사항이나 면담 내용을 입력하세요..."
                rows={2}
                className="w-full rounded-xl border border-[#D6E0F0] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary/50 resize-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">주요 후속 조치 (Follow-up)</label>
              <input 
                type="text"
                value={newLog.followup}
                onChange={(e) => setNewLog({ ...newLog, followup: e.target.value })}
                placeholder="예) 차주 인력 충원 여부 확인"
                className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm text-slate-700 outline-none focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-2 border-t border-slate-100 pt-6">
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-[#D6E0F0] bg-white px-6 py-2 text-sm font-medium text-slate-600 hover:bg-[#F8FAFF] transition-colors">취소</button>
            <button onClick={handleCreate} className="rounded-lg bg-primary px-8 py-2 text-sm font-bold text-white shadow-md hover:bg-[#1E5BE9] transition-all active:scale-95">방문 일지 저장하기</button>
          </div>
        </section>
      )}

      {/* Visit Records List */}
      <section className="space-y-4">
        {visits.map((v) => (
          <article key={v.id} className={cn(
            "rounded-2xl border transition-all duration-300 shadow-sm",
            v.expanded ? "border-border bg-white ring-1 ring-primary/5 shadow-elevated" : "border-border/90 bg-card hover:border-[#DCE4F3]"
          )}>
            {/* Summary Row */}
            <div className="flex w-full items-center justify-between p-5">
              <button
                onClick={() => toggleExpand(v.id)}
                className="flex items-center gap-4 text-left flex-1"
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors shadow-sm",
                  v.expanded ? "bg-primary text-white" : "bg-[#EEF4FF] text-primary"
                )}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-slate-900">{v.store}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">SV {v.supervisor.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
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
                    v.isEditing ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {v.isEditing ? <Save className="h-4.5 w-4.5" /> : <Edit3 className="h-4.5 w-4.5" />}
                </button>
                <button 
                  onClick={() => deleteRecord(v.id)}
                  title="삭제"
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button onClick={() => toggleExpand(v.id)} className="p-1.5 text-slate-300">
                  <ChevronDown className={cn("h-5 w-5 transition-transform", v.expanded && "rotate-180")} />
                </button>
              </div>
            </div>

            {/* Detailed Content */}
            {v.expanded && (
              <div className="border-t border-border/60 bg-white animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-7 p-6 border-r border-border/60 space-y-6">
                    {/* AI Briefing */}
                    <div className="rounded-xl border border-primary/10 bg-[#F7FAFF] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold text-primary">AI 사전 브리핑</p>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{v.aiBriefing}"</p>
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800 px-1">현장 점검 상세</label>
                      {v.isEditing ? (
                        <textarea 
                          value={v.notes}
                          onChange={(e) => updateContent(v.id, "notes", e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-primary/30 bg-white p-4 text-sm text-slate-700 outline-none focus:border-primary shadow-sm"
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[100px]">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{v.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Owner Feedback */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800 px-1">점주 피드백</label>
                      {v.isEditing ? (
                        <textarea 
                          value={v.ownerFeedback}
                          onChange={(e) => updateContent(v.id, "ownerFeedback", e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-primary/30 bg-white p-4 text-sm text-slate-700 outline-none focus:border-primary shadow-sm"
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[80px]">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{v.ownerFeedback || "입력된 피드백이 없습니다."}</p>
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div className="grid grid-cols-3 gap-3">
                      {v.photos?.map((p, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-slate-50 border border-border flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer group">
                          <Camera className="h-5 w-5 text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500 px-2 truncate w-full text-center">{p}</span>
                        </div>
                      ))}
                      <div className="aspect-square rounded-xl border-2 border-dashed border-[#DCE4F3] bg-white flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-bold">사진 추가</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-5 p-6 bg-[#F7FAFF]/50 space-y-6">
                    {/* Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-bold text-slate-800">점검 항목</h4>
                        </div>
                        <span className="text-xs font-bold text-primary bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#CFE0FF] shadow-sm">
                          SCORE {Math.round((v.checklist.filter(c => c.status === "pass").length / v.checklist.length) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {v.checklist.map((item) => (
                          <button 
                            key={item.id} 
                            onClick={() => updateChecklist(v.id, item.id)}
                            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]"
                          >
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              item.status === "pass" ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" :
                              item.status === "warn" ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.5)]"
                            )} />
                            <span className="text-[11px] font-bold text-slate-400 w-10 shrink-0 text-left">{item.category}</span>
                            <span className="text-sm font-medium text-slate-700 flex-1 truncate text-left">{item.task}</span>
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
                        <h4 className="text-sm font-bold text-slate-800">후속 조치 계획</h4>
                      </div>
                      <div className="space-y-2.5">
                        {v.followups.map((f) => (
                          <button 
                            key={f.id} 
                            onClick={() => toggleFollowup(v.id, f.id)}
                            className={cn(
                              "w-full text-left rounded-xl border p-3.5 shadow-sm transition-all active:scale-[0.98]",
                              f.done ? "bg-[#F8FAFF] border-emerald-100 opacity-70" : "bg-white border-slate-200 hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className={cn("text-sm font-bold", f.done ? "text-slate-400 line-through" : "text-[#2454C8]")}>{f.task}</p>
                              <div className={cn(
                                "h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors",
                                f.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200"
                              )}>
                                {f.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-slate-400">
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
                <div className="border-t border-border/60 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    리포트 전송 시 해당 매장 점주 앱으로 실시간 알림이 발송됩니다.
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-10 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1E5BE9] active:scale-95">
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
