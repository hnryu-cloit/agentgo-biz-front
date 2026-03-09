import type React from "react";
import { useState } from "react";
import { MapPin, Plus, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">방문 기록</h2>
            <p className="mt-1 text-sm text-slate-500">매장 방문 후 특이사항·지도 내용·후속 액션을 기록합니다.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            방문 기록 추가
          </button>
        </div>
      </section>

      {/* New Log Form */}
      {showForm && (
        <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 md:p-6">
          <h3 className="text-base font-bold text-slate-900">새 방문 기록</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">방문 매장</label>
              <select
                value={form.store}
                onChange={(e) => setForm((f) => ({ ...f, store: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
              >
                {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">방문일</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">방문 특이사항 / 지도 내용</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="방문 시 확인한 내용, 코칭 사항 등을 기록하세요..."
              rows={4}
              className="w-full rounded-xl border border-[#D6E0F0] bg-white px-3 py-2 text-sm resize-none focus:outline-none"
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">후속 액션</label>
            <input
              type="text"
              value={form.followup}
              onChange={(e) => setForm((f) => ({ ...f, followup: e.target.value }))}
              placeholder="예) 2주 이내 재방문 확인"
              className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
            />
          </div>

          {saved ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">방문 기록이 저장되었습니다.</p>
            </div>
          ) : (
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!form.notes.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          )}
        </section>
      )}

      {/* Visit Records */}
      <section className="space-y-3">
        {visits.map((v) => (
          <article key={v.id} className="rounded-2xl border border-border/90 bg-card">
            <button
              onClick={() => toggleExpand(v.id)}
              className="flex w-full items-center justify-between p-5"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{v.store}</p>
                  <p className="text-xs text-slate-400">{v.visitDate} · {v.supervisor}</p>
                </div>
              </div>
              {v.expanded
                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                : <ChevronDown className="h-4 w-4 text-slate-400" />
              }
            </button>

            {v.expanded && (
              <div className="border-t border-border/60 px-5 pb-5">
                <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
                  <p className="text-xs font-semibold text-slate-500">방문 특이사항 / 지도 내용</p>
                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{v.notes}</p>
                </div>

                {v.followups.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">후속 액션</p>
                    <div className="space-y-1.5">
                      {v.followups.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {f}
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
