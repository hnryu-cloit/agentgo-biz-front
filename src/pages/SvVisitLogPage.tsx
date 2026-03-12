import type React from "react";
import { useState } from "react";
import { MapPin, Plus, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";
import { cn } from "@/lib/utils";

type VisitRecord = {
  id: string;
  store: string;
  visitDate: string;
  supervisor: string;
  notes: string;
  followups: string[];
  expanded: boolean;
};

const storeNames = storeResources.slice(0, 5).map((s, i) => s?.name ?? `${String.fromCharCode(65 + i)}매장`);

const mockVisits: VisitRecord[] = [
  {
    id: "v1",
    store: storeNames[0],
    visitDate: "2026-03-07",
    supervisor: "김수진 SV",
    notes: "피크타임 직원 배치 부족 확인. 오후 12~13시 최소 2명 추가 배치 필요. 매장 청결도 양호.",
    followups: ["2주 이내 추가 인력 배치 확인", "메뉴B 가격 조정 논의 후속"],
    expanded: false,
  },
  {
    id: "v2",
    store: storeNames[1],
    visitDate: "2026-02-28",
    supervisor: "박재원 SV",
    notes: "주방 동선 개선 교육 실시. 취소율 감소 위해 주문 후 15분 알림 설정 권고.",
    followups: ["취소율 3주 후 재측정"],
    expanded: false,
  },
  {
    id: "v3",
    store: storeNames[2],
    visitDate: "2026-02-21",
    supervisor: "김수진 SV",
    notes: "공지 이행률 80% — 잔여 1건 3월 10일 마감 재확인. 직원 서비스 교육 만족도 높음.",
    followups: ["공지 이행 완료 확인 (3월 10일)"],
    expanded: false,
  },
];

type NewLog = {
  store: string;
  visitDate: string;
  notes: string;
  followup: string;
};

export const SvVisitLogPage: React.FC = () => {
  const [visits, setVisits] = useState(mockVisits);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<NewLog>({
    store: storeNames[0],
    visitDate: "2026-03-09",
    notes: "",
    followup: "",
  });

  const toggleExpand = (id: string) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, expanded: !v.expanded } : v)));
  };

  const handleSave = () => {
    if (!form.notes.trim()) return;
    const newRecord: VisitRecord = {
      id: `v${Date.now()}`,
      store: form.store,
      visitDate: form.visitDate,
      supervisor: "김수진 SV",
      notes: form.notes,
      followups: form.followup ? [form.followup] : [],
      expanded: true,
    };
    setVisits((prev) => [newRecord, ...prev]);
    setSaved(true);
    setTimeout(() => {
      setShowForm(false);
      setSaved(false);
      setForm({ store: storeNames[0], visitDate: "2026-03-09", notes: "", followup: "" });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">현장 기록</p>
            <h2 className="text-2xl font-bold text-slate-900">매장 방문 로그</h2>
            <p className="mt-1 text-base text-slate-500">가맹점 방문 후 발생한 특이사항 및 코칭 가이드를 상세히 기록합니다.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            새 방문 일지 작성
          </button>
        </div>
      </section>

      {/* New Log Form */}
      {showForm && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-6 shadow-elevated animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="rounded-lg bg-white p-1.5 shadow-sm border border-[#CFE0FF]">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">신규 방문 기록 작성</h3>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">방문 매장 선택</label>
              <select
                value={form.store}
                onChange={(e) => setForm((f) => ({ ...f, store: e.target.value }))}
                className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 transition-all"
              >
                {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">현장 방문 일자</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
                className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
          
          <div className="mt-5 space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">주요 코칭 내용 및 특이사항</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="방문 시 확인한 운영 상태, 점주 면담 내용, 개선 필요 사항 등을 자유롭게 기록하세요..."
              rows={4}
              className="w-full rounded-2xl border border-[#D6E0F0] bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-primary/50 transition-all resize-none"
            />
          </div>
          
          <div className="mt-5 space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">SV 권고 후속 액션 (Follow-up)</label>
            <div className="relative">
              <input
                type="text"
                value={form.followup}
                onChange={(e) => setForm((f) => ({ ...f, followup: e.target.value }))}
                placeholder="예) 차주 피크타임 인력 충원 여부 재확인"
                className="h-11 w-full rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-primary/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Required</div>
            </div>
          </div>

          {saved ? (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-white shadow-lg animate-in fade-in zoom-in-95 duration-500">
              <CheckCircle2 className="h-5 w-5 shadow-sm" />
              <p className="text-sm font-black">방문 일지가 성공적으로 등록되었습니다.</p>
            </div>
          ) : (
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-500 shadow-sm transition-all hover:bg-slate-50"
              >
                작성 취소
              </button>
              <button
                onClick={handleSave}
                disabled={!form.notes.trim()}
                className="rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                일지 저장하기
              </button>
            </div>
          )}
        </section>
      )}

      {/* Visit Records */}
      <section className="space-y-4">
        {visits.map((v) => (
          <article key={v.id} className={cn(
            "rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden",
            v.expanded ? "border-[#CFE0FF] bg-white ring-1 ring-primary/5 shadow-md" : "border-border/90 bg-card"
          )}>
            <button
              onClick={() => toggleExpand(v.id)}
              className="flex w-full items-center justify-between p-5 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors",
                  v.expanded ? "bg-primary text-white" : "bg-[#EEF4FF] text-primary"
                )}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{v.store}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {v.visitDate} <span className="mx-1 text-slate-200">|</span> {v.supervisor}
                  </p>
                </div>
              </div>
              <div className={cn(
                "rounded-full p-1.5 transition-all",
                v.expanded ? "bg-primary/10 text-primary rotate-180" : "bg-slate-100 text-slate-400"
              )}>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {v.expanded && (
              <div className="border-t border-slate-100 bg-[#F8FAFF]/30 px-6 py-6 animate-in slide-in-from-top-2 duration-300">
                <div className="rounded-2xl border border-[#DCE4F3] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Observations</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{v.notes}</p>
                </div>

                {v.followups.length > 0 && (
                  <div className="mt-5 space-y-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary uppercase tracking-widest">Follow-ups</span>
                    </div>
                    <div className="grid gap-2">
                      {v.followups.map((f) => (
                        <div key={f} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 shadow-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-700">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
