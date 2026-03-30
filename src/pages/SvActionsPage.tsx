import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { escalateAction, getSvActions, getSvStores } from "@/services/supervisor";

type EscalationForm = {
  storeId: string;
  content: string;
  level: "P0" | "P1";
};

type ComplianceSummary = {
  store_id: string;
  store_name: string;
  total_actions: number;
  executed: number;
  deferred: number;
  execution_rate: number;
};

export const SvActionsPage: React.FC = () => {
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [summaries, setSummaries] = useState<ComplianceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterStore, setFilterStore] = useState("전체");
  const [escForm, setEscForm] = useState<EscalationForm>({ storeId: "", content: "", level: "P0" });
  const [escSent, setEscSent] = useState(false);
  const [escError, setEscError] = useState<string | null>(null);
  const [showEscModal, setShowEscModal] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([getSvStores(), getSvActions()])
      .then(([storeResponse, actionResponse]) => {
        if (!alive) return;
        const nextStores = storeResponse.map((store) => ({ id: store.id, name: store.name }));
        setStores(nextStores);
        setSummaries(actionResponse);
        setEscForm((prev) => ({ ...prev, storeId: prev.storeId || nextStores[0]?.id || "" }));
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "SV 액션 현황을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => summaries.filter((summary) => filterStore === "전체" || summary.store_name === filterStore),
    [filterStore, summaries],
  );

  const rateByStore = useMemo(
    () => summaries.map((summary) => ({
      name: summary.store_name,
      done: summary.executed,
      total: summary.total_actions,
      rate: Math.round(summary.execution_rate * 100),
    })),
    [summaries],
  );

  const handleEsc = async () => {
    if (!escForm.content.trim()) return;
    setEscError(null);
    try {
      const targetSummary = summaries.find((summary) => summary.store_id === escForm.storeId);
      const actionRef = targetSummary?.store_id;
      if (!actionRef) {
        setEscError("에스컬레이션할 대상 액션 기준 데이터가 없습니다.");
        return;
      }

      await escalateAction(actionRef, {
        store_id: escForm.storeId,
        title: `[${escForm.level}] 현장 리스크 보고`,
        description: escForm.content,
        severity: escForm.level,
      });
      setEscSent(true);
      setTimeout(() => {
        setShowEscModal(false);
        setEscSent(false);
        setEscForm((current) => ({ ...current, content: "" }));
      }, 1500);
    } catch (error) {
      setEscSent(false);
      setEscError(error instanceof Error ? error.message : "에스컬레이션 전송에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <LoadingState message="SV 액션 현황을 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="SV 액션 현황을 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">현장 코칭</p>
              <h2 className="text-2xl font-bold text-foreground">운영 액션 관리</h2>
              <p className="mt-1 text-base text-muted-foreground">점주 액션 이행률과 보류 현황을 실제 API 기준으로 확인하고 이슈를 보고합니다.</p>
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

        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-lg bg-[var(--muted)] p-1.5 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">매장별 가이드 이행률</h3>
          </div>

          <div className="space-y-5">
            {rateByStore.length === 0 ? (
              <EmptyState title="액션 이행률 데이터가 없습니다" description="담당 매장의 액션 집계가 아직 생성되지 않았습니다." />
            ) : rateByStore.map((rate) => (
              <div key={rate.name} className="group flex items-center gap-4">
                <span className="w-20 shrink-0 text-sm font-bold text-[#34415b]">{rate.name}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)] shadow-inner">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        rate.rate === 100 ? "bg-emerald-400" : rate.rate >= 50 ? "bg-primary" : "bg-red-400",
                      )}
                      style={{ width: `${rate.rate}%` }}
                    />
                  </div>
                </div>
                <div className="flex w-32 shrink-0 items-center justify-end gap-3">
                  <span className="font-mono text-[11px] font-bold text-[var(--subtle-foreground)]">
                    {rate.done}/{rate.total} <span className="opacity-60">ACTS</span>
                  </span>
                  <span className={cn(
                    "w-12 text-right text-sm font-black",
                    rate.rate === 100 ? "text-emerald-600" : rate.rate >= 50 ? "text-[#2f66ff]" : "text-red-600",
                  )}>
                    {rate.rate}%
                  </span>
                  {rate.rate < 50 && (
                    <span className="animate-pulse rounded border border-red-100 bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600 shadow-sm">
                      RISK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#eef3ff] p-1.5 shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">매장별 액션 이행 현황</h3>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-1.5 shadow-sm">
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="h-8 rounded-lg border border-[var(--border)] bg-card px-3 text-[11px] font-bold text-[#4a5568] shadow-sm outline-none"
              >
                <option value="전체">전체 매장</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="표시할 액션 이행 현황이 없습니다" description="선택한 조건에 맞는 매장 액션 집계가 없습니다." />
          ) : (
          <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f4f7ff] text-[#4a5568]">
                <tr>
                  <th className="px-4 py-3 font-bold">매장명</th>
                  <th className="px-4 py-3 text-center font-bold">전체 액션</th>
                  <th className="px-4 py-3 text-center font-bold">실행 완료</th>
                  <th className="px-4 py-3 text-center font-bold">보류</th>
                  <th className="px-4 py-3 text-center font-bold">미이행</th>
                  <th className="px-4 py-3 text-right font-bold">현재 상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((summary) => {
                  const pendingCount = Math.max(summary.total_actions - summary.executed - summary.deferred, 0);
                  const executionRate = Math.round(summary.execution_rate * 100);
                  return (
                    <tr key={summary.store_id} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50 font-medium">
                      <td className="px-4 py-4 font-bold text-[#1a2138]">{summary.store_name}</td>
                      <td className="px-4 py-4 text-center text-[#4a5568]">{summary.total_actions}</td>
                      <td className="px-4 py-4 text-center text-emerald-600">{summary.executed}</td>
                      <td className="px-4 py-4 text-center text-amber-600">{summary.deferred}</td>
                      <td className="px-4 py-4 text-center text-[var(--subtle-foreground)]">{pendingCount}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm",
                            executionRate >= 80
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : executionRate >= 40
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-[#d5deec] bg-card text-[var(--subtle-foreground)]",
                          )}>
                            {executionRate >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : executionRate >= 40 ? (
                              <Clock className="h-4 w-4 text-amber-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-[#b0bdd4]" />
                            )}
                            이행률 {executionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </section>
      </div>

      {showEscModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h4 className="text-lg font-bold text-foreground">본사 에스컬레이션</h4>
            <p className="mt-1 text-sm text-muted-foreground">심각한 이슈를 본사 담당자에게 보고합니다.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">대상 매장</label>
                <select
                  value={escForm.storeId}
                  onChange={(e) => setEscForm((current) => ({ ...current, storeId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-[#d5deec] bg-card px-3 text-sm"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">긴급도</label>
                <div className="flex gap-2">
                  {(["P0", "P1"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setEscForm((current) => ({ ...current, level }))}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                        escForm.level === level ? "border-red-300 bg-red-500 text-white" : "border-[#d5deec] bg-card text-[#4a5568]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#34415b]">보고 내용</label>
                <textarea
                  value={escForm.content}
                  onChange={(e) => setEscForm((current) => ({ ...current, content: e.target.value }))}
                  placeholder="이슈 내용을 상세히 입력하세요..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#d5deec] bg-card px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            {escSent && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-700">본사에 에스컬레이션 보고가 전송되었습니다.</p>
              </div>
            )}

            {escError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {escError}
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
