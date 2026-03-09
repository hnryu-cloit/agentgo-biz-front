import type React from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Send } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

type ActionStatus = "completed" | "pending" | "ignored";

type ActionRecord = {
  id: string;
  store: string;
  title: string;
  level: "P0" | "P1";
  status: ActionStatus;
  proposedAt: string;
  completedAt?: string;
};

const storeNames = storeResources.slice(0, 5).map((s, i) => s?.name ?? `${String.fromCharCode(65 + i)}매장`);

const actionRecords: ActionRecord[] = [
  { id: "a1", store: storeNames[0], title: "14~17시 타임 프로모션 실행", level: "P0", status: "completed", proposedAt: "03-05", completedAt: "03-05" },
  { id: "a2", store: storeNames[0], title: "이탈 고객 42명 쿠폰 발송", level: "P0", status: "pending", proposedAt: "03-06" },
  { id: "a3", store: storeNames[0], title: "메뉴B 마진 경보 확인", level: "P1", status: "ignored", proposedAt: "03-04" },
  { id: "a4", store: storeNames[1], title: "직원 서비스 교육 일정 조율", level: "P1", status: "pending", proposedAt: "03-06" },
  { id: "a5", store: storeNames[1], title: "포장재 입고 확인", level: "P0", status: "completed", proposedAt: "03-05", completedAt: "03-07" },
  { id: "a6", store: storeNames[2], title: "주말 취소율 모니터링 강화", level: "P0", status: "pending", proposedAt: "03-07" },
  { id: "a7", store: storeNames[3], title: "비피크 프로모션 시뮬레이션 검토", level: "P1", status: "completed", proposedAt: "03-03", completedAt: "03-04" },
  { id: "a8", store: storeNames[4], title: "VIP 고객 감사 오퍼 발송", level: "P1", status: "completed", proposedAt: "03-02", completedAt: "03-03" },
];

type EscalationForm = {
  store: string;
  content: string;
  level: "P0" | "P1";
};

const statusIcon: Record<ActionStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  ignored: <XCircle className="h-4 w-4 text-slate-300" />,
};

const statusLabel: Record<ActionStatus, string> = {
  completed: "완료",
  pending: "미이행",
  ignored: "무시",
};

const statusClass: Record<ActionStatus, string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  ignored: "border-[#DCE4F3] bg-white text-slate-400",
};

export const SvActionsPage: React.FC = () => {
  const [filterStore, setFilterStore] = useState("전체");
  const [filterStatus, setFilterStatus] = useState<ActionStatus | "전체">("전체");
  const [escForm, setEscForm] = useState<EscalationForm>({ store: storeNames[0], content: "", level: "P0" });
  const [escSent, setEscSent] = useState(false);
  const [showEscModal, setShowEscModal] = useState(false);

  const filtered = useMemo(
    () => actionRecords.filter((a) => {
      const storeMatch = filterStore === "전체" || a.store === filterStore;
      const statusMatch = filterStatus === "전체" || a.status === filterStatus;
      return storeMatch && statusMatch;
    }),
    [filterStore, filterStatus],
  );

  // 이행률 계산
  const rateByStore = useMemo(
    () => storeNames.map((name) => {
      const acts = actionRecords.filter((a) => a.store === name);
      const done = acts.filter((a) => a.status === "completed").length;
      return { name, done, total: acts.length, rate: acts.length > 0 ? Math.round((done / acts.length) * 100) : 0 };
    }),
    [],
  );

  const handleEsc = () => {
    if (!escForm.content.trim()) return;
    setEscSent(true);
    setTimeout(() => {
      setShowEscModal(false);
      setEscSent(false);
      setEscForm((f) => ({ ...f, content: "" }));
    }, 1500);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">액션 관리</h2>
              <p className="mt-1 text-sm text-slate-500">점주 권장 액션 이행 현황을 추적하고 에스컬레이션합니다.</p>
            </div>
            <button
              onClick={() => setShowEscModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <AlertTriangle className="h-4 w-4" />
              본사 에스컬레이션
            </button>
          </div>
        </section>

        {/* 이행률 Summary */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="text-lg font-bold text-slate-900">매장별 액션 이행률</h3>
          <div className="mt-4 space-y-3">
            {rateByStore.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm font-medium text-slate-700">{r.name}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.rate === 100 ? "bg-emerald-400" : r.rate >= 50 ? "bg-primary" : "bg-red-400"
                      }`}
                      style={{ width: `${r.rate}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-slate-500">{r.done}/{r.total}</span>
                <span className={`w-10 shrink-0 text-right text-sm font-bold ${
                  r.rate === 100 ? "text-emerald-600" : r.rate >= 50 ? "text-primary" : "text-red-600"
                }`}>{r.rate}%</span>
                {r.rate < 50 && (
                  <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    미이행↑
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action List */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">액션 이행 내역</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="h-8 rounded-lg border border-[#D6E0F0] bg-white px-2 text-xs text-slate-700"
              >
                <option value="전체">전체 매장</option>
                {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {(["전체", "completed", "pending", "ignored"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={
                    filterStatus === s
                      ? "rounded border border-[#BFD4FF] bg-[#EEF4FF] px-2 py-1 text-xs font-semibold text-primary"
                      : "rounded border border-[#D6E0F0] bg-white px-2 py-1 text-xs text-slate-600"
                  }
                >
                  {s === "전체" ? "전체" : statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#F7FAFF] text-slate-600">
                <tr>
                  <th className="px-4 py-3">매장</th>
                  <th className="px-4 py-3">액션</th>
                  <th className="px-4 py-3">등급</th>
                  <th className="px-4 py-3">제안일</th>
                  <th className="px-4 py-3">이행일</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.store}</td>
                    <td className="px-4 py-3 text-slate-700">{a.title}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${a.level === "P0" ? "bg-red-500" : "bg-amber-500"}`}>
                        {a.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.proposedAt}</td>
                    <td className="px-4 py-3 text-slate-500">{a.completedAt ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium w-fit ${statusClass[a.status]}`}>
                        {statusIcon[a.status]}
                        {statusLabel[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Escalation Modal */}
      {showEscModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">본사 에스컬레이션</h4>
            <p className="mt-1 text-sm text-slate-500">심각한 이슈를 본사 담당자에게 보고합니다.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">대상 매장</label>
                <select
                  value={escForm.store}
                  onChange={(e) => setEscForm((f) => ({ ...f, store: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                >
                  {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">긴급도</label>
                <div className="flex gap-2">
                  {(["P0", "P1"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setEscForm((f) => ({ ...f, level: l }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                        escForm.level === l ? "border-red-300 bg-red-500 text-white" : "border-[#DCE4F3] bg-white text-slate-600"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">보고 내용</label>
                <textarea
                  value={escForm.content}
                  onChange={(e) => setEscForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="이슈 내용을 상세히 입력하세요..."
                  rows={4}
                  className="w-full rounded-xl border border-[#D6E0F0] bg-white px-3 py-2 text-sm resize-none focus:outline-none"
                />
              </div>
            </div>

            {escSent && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-700">본사에 에스컬레이션 보고가 전송되었습니다.</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEscModal(false)}
                className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700"
              >
                취소
              </button>
              <button
                onClick={handleEsc}
                disabled={!escForm.content.trim() || escSent}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                에스컬레이션 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};