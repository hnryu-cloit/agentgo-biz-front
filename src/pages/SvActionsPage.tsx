import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSvStores } from "@/services/supervisor";

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

type EscalationForm = {
  store: string;
  content: string;
  level: "P0" | "P1";
};

const statusIcon: Record<ActionStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  ignored: <XCircle className="h-4 w-4 text-[#b0bdd4]" />,
};

const statusLabel: Record<ActionStatus, string> = {
  completed: "완료",
  pending: "미이행",
  ignored: "무시",
};

const statusClass: Record<ActionStatus, string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  ignored: "border-[#d5deec] bg-card text-[var(--subtle-foreground)]",
};

export const SvActionsPage: React.FC = () => {
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [actionRecords, setActionRecords] = useState<ActionRecord[]>([]);
  const [filterStore, setFilterStore] = useState("전체");
  const [filterStatus, setFilterStatus] = useState<ActionStatus | "전체">("전체");
  const [escForm, setEscForm] = useState<EscalationForm>({ store: "", content: "", level: "P0" });
  const [escSent, setEscSent] = useState(false);
  const [showEscModal, setShowEscModal] = useState(false);

  useEffect(() => {
    let alive = true;
    getSvStores()
      .then((stores) => {
        if (!alive) return;
        const names = stores.map((store) => store.name);
        setStoreNames(names);
        setEscForm((prev) => ({ ...prev, store: prev.store || names[0] || "" }));
        setActionRecords(
          stores.map((store, index) => ({
            id: `a-${store.id}`,
            store: store.name,
            title: store.risk_score >= 10 ? "긴급 현장 코칭 필요" : store.cancel_rate >= 4 ? "취소율 개선 점검" : "운영 모니터링 유지",
            level: store.risk_score >= 10 ? "P0" : "P1",
            status: index % 3 === 0 ? "completed" : index % 3 === 1 ? "pending" : "ignored",
            proposedAt: "03-16",
            completedAt: index % 3 === 0 ? "03-16" : undefined,
          })),
        );
      })
      .catch(() => {
        if (!alive) return;
        setStoreNames([]);
        setActionRecords([]);
      });
    return () => { alive = false; };
  }, []);

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
        <section className="app-card p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">현장 코칭</p>
              <h2 className="text-2xl font-bold text-foreground">운영 액션 관리</h2>
              <p className="mt-1 text-base text-muted-foreground">점주에게 제안된 AI 액션의 이행 현황을 모니터링하고 이슈를 보고합니다.</p>
            </div>
            <button
              onClick={() => setShowEscModal(true)}
              className="group flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="h-4 w-4 transition-transform group-hover:scale-110" />
              본사 긴급 에스컬레이션
            </button>
          </div>
        </section>

        {/* 이행률 Summary */}
        <section className="app-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="rounded-lg bg-[var(--muted)] p-1.5 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">매장별 가이드 이행률</h3>
          </div>
          
          <div className="space-y-5">
            {rateByStore.map((r) => (
              <div key={r.name} className="group flex items-center gap-4">
                <span className="w-20 shrink-0 text-sm font-bold text-[#34415b]">{r.name}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)] shadow-inner">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        r.rate === 100 ? "bg-emerald-400" : r.rate >= 50 ? "bg-primary" : "bg-red-400"
                      )}
                      style={{ width: `${r.rate}%` }}
                    />
                  </div>
                </div>
                <div className="flex w-32 shrink-0 items-center justify-end gap-3">
                  <span className="text-[11px] font-bold text-[var(--subtle-foreground)] font-mono">{r.done}/{r.total} <span className="opacity-60">ACTS</span></span>
                  <span className={cn(
                    "w-12 text-right text-sm font-black",
                    r.rate === 100 ? "text-emerald-600" : r.rate >= 50 ? "text-[#2f66ff]" : "text-red-600"
                  )}>{r.rate}%</span>
                  {r.rate < 50 && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600 border border-red-100 shadow-sm animate-pulse">
                      RISK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action List */}
        <section className="app-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#eef3ff] p-1.5 shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">전체 액션 히스토리</h3>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1.5 shadow-sm">
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="h-8 rounded-lg bg-card px-3 text-[11px] font-bold text-[#4a5568] shadow-sm outline-none border border-[var(--border)]"
              >
                <option value="전체">전체 매장</option>
                {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <div className="w-px h-8 bg-[var(--border)] mx-1 hidden sm:block" />
              {(["전체", "completed", "pending", "ignored"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[11px] font-black transition-all",
                    filterStatus === s
                      ? "bg-card text-[#2f66ff] shadow-sm"
                      : "text-[var(--subtle-foreground)] hover:text-[#4a5568]"
                  )}
                >
                  {s === "전체" ? "ALL" : statusLabel[s].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f4f7ff] text-[#4a5568]">
                <tr>
                  <th className="px-4 py-3 font-bold">매장명</th>
                  <th className="px-4 py-3 font-bold">액션 타이틀</th>
                  <th className="px-4 py-3 font-bold text-center">우선순위</th>
                  <th className="px-4 py-3 font-bold text-center">제안일</th>
                  <th className="px-4 py-3 font-bold text-center">이행일</th>
                  <th className="px-4 py-3 text-right font-bold">현재 상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50 font-medium">
                    <td className="px-4 py-4 font-bold text-[#1a2138]">{a.store}</td>
                    <td className="px-4 py-4 text-[#4a5568] text-[13px]">{a.title}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-black text-white shadow-sm",
                        a.level === "P0" ? "bg-red-500" : "bg-amber-500"
                      )}>
                        {a.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-[var(--subtle-foreground)] font-mono text-xs">{a.proposedAt}</td>
                    <td className="px-4 py-4 text-center text-[var(--subtle-foreground)] font-mono text-xs">{a.completedAt ?? "-"}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm",
                          statusClass[a.status]
                        )}>
                          {statusIcon[a.status]}
                          {statusLabel[a.status]}
                        </span>
                      </div>
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h4 className="text-lg font-bold text-foreground">본사 에스컬레이션</h4>
            <p className="mt-1 text-sm text-muted-foreground">심각한 이슈를 본사 담당자에게 보고합니다.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">대상 매장</label>
                <select
                  value={escForm.store}
                  onChange={(e) => setEscForm((f) => ({ ...f, store: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm"
                >
                  {storeNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">긴급도</label>
                <div className="flex gap-2">
                  {(["P0", "P1"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setEscForm((f) => ({ ...f, level: l }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                        escForm.level === l ? "border-red-300 bg-red-500 text-white" : "border-[#d5deec] bg-card text-[#4a5568]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">보고 내용</label>
                <textarea
                  value={escForm.content}
                  onChange={(e) => setEscForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="이슈 내용을 상세히 입력하세요..."
                  rows={4}
                  className="w-full rounded-xl border border-[#d5deec] bg-card px-3 py-2 text-sm resize-none focus:outline-none"
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
                className="rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm text-[#34415b]"
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
