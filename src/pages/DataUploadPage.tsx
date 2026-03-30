import { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, RefreshCcw, Upload, Loader2, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistActionBar } from "@/components/commons/AssistActionBar";
import { InlineAssistPanel } from "@/components/commons/InlineAssistPanel";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { getResourceCatalog, getResourceDataset, getUploadJobs, retryUploadJob, importResourceDataset, uploadDataFile, confirmDataMapping } from "@/services/data";
import type { DataType, ResourceSourceCatalog, UploadJobResponse } from "@/types/api";

type ResourceType = Extract<DataType, "pos_daily_sales" | "bo_point_usage" | "receipt_listing" | "menu_lineup">;

const typeLabel: Record<ResourceType, string> = {
  pos_daily_sales: "POS 일자별 매출",
  bo_point_usage: "BO 포인트 사용",
  receipt_listing: "영수증 목록",
  menu_lineup: "메뉴 라인업",
};

function openAiAssist(label: string, prompt: string, contextText?: string, intent: "summary" | "action" = "summary") {
  window.dispatchEvent(new CustomEvent("agentgo-ai-assist", {
    detail: { label, prompt, contextText, intent },
  }));
}

export const DataUploadPage = () => {
  const [sources, setSources] = useState<ResourceSourceCatalog[]>([]);
  const [selectedType, setSelectedType] = useState<ResourceType>("pos_daily_sales");
  const [selectedStore, setSelectedStore] = useState("");
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadJobResponse[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mappingPeriodStart, setMappingPeriodStart] = useState("");
  const [mappingPeriodEnd, setMappingPeriodEnd] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAssistCard, setSelectedAssistCard] = useState<string | null>(null);
  const [inlineAssist, setInlineAssist] = useState<{ cardId: string; title: string; why: string; actionLabel: string } | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    Promise.all([getResourceCatalog(), getUploadJobs()])
      .then(([catalog, jobs]) => {
        setSources(catalog.sources);
        setUploadHistory(jobs);
        if (catalog.sources.length > 0 && !catalog.sources.some((source) => source.source_kind === selectedType)) {
          setSelectedType(catalog.sources[0].source_kind as ResourceType);
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "데이터 업로드 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSource = useMemo(
    () => sources.find((source) => source.source_kind === selectedType) ?? null,
    [selectedType, sources],
  );

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const res = await importResourceDataset(selectedType);
      alert(`${res.imported_count}건의 데이터가 PostgreSQL에 적재되었습니다.`);
      loadData();
    } catch {
      alert("데이터 적재 중 오류가 발생했습니다. DB 마이그레이션 상태를 확인하세요.");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (!selectedStore) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    let alive = true;
    setPreviewError(null);
    getResourceDataset(selectedType, selectedStore, 10)
      .then((dataset) => {
        if (!alive) return;
        setPreview(dataset.rows.length > 0 ? { headers: dataset.headers, rows: dataset.rows } : null);
      })
      .catch((error) => {
        if (!alive) return;
        setPreview(null);
        setPreviewError(error instanceof Error ? error.message : "미리보기를 불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, [selectedStore, selectedType]);

  useEffect(() => {
    const nextStore = activeSource?.stores[0]?.store_key ?? "";
    setSelectedStore(nextStore);
  }, [activeSource]);

  const handleRetry = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      const updated = await retryUploadJob(jobId);
      setUploadHistory((current) => current.map((row) => (row.id === jobId ? updated : row)));
      setStatusMessage("실패한 업로드 작업을 재시도 상태로 변경했습니다.");
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedStore) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const created = await uploadDataFile(selectedFile, selectedType, selectedStore);
      if (mappingPeriodStart || mappingPeriodEnd) {
        await confirmDataMapping({
          job_id: created.job_id,
          store_id: selectedStore,
          period_start: mappingPeriodStart || undefined,
          period_end: mappingPeriodEnd || undefined,
        });
      }
      setSelectedFile(null);
      setMappingPeriodStart("");
      setMappingPeriodEnd("");
      setStatusMessage("파일 업로드를 시작했습니다. 업로드 이력에서 처리 상태를 확인할 수 있습니다.");
      loadData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssist = (
    cardId: string,
    label: string,
    prompt: string,
    contextText?: string,
    intent: "summary" | "action" = "summary",
  ) => {
    setSelectedAssistCard(cardId);
    setInlineAssist({
      cardId,
      title: label,
      why: contextText
        ? `${contextText} 기준으로 어떤 데이터가 연결되어 있는지 먼저 확인해야 합니다.`
        : "이 항목에서 어떤 상태를 먼저 봐야 하는지 확인해야 합니다.",
      actionLabel: intent === "action"
        ? "재적재, 비교 확인, 미리보기 검토 중 1개만 먼저 정하세요."
        : "해설을 본 뒤 어떤 리소스를 먼저 점검할지 정하세요.",
    });
    openAiAssist(label, prompt, contextText, intent);
  };

  if (isLoading) {
    return <LoadingState message="데이터 업로드 화면을 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="데이터 업로드 정보를 불러올 수 없습니다" message={loadError} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 pb-10">
      <section
        className={cn(
          "rounded-2xl border p-5 shadow-elevated md:p-6 transition-all",
          selectedAssistCard === "upload-header"
            ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
            : "border-border/90 bg-card",
        )}
      >
        <h2 className="text-2xl font-bold text-slate-900">데이터 업로드</h2>
        <p className="mt-1 text-base text-slate-500">`resource/*` 업로드가 완료되어 DB에 적재된 상태를 기준으로 카탈로그와 미리보기를 확인합니다.</p>

        <AssistActionBar
          className="mt-4"
          summary={{
            label: "해설 보기",
            onClick: () => handleAssist("upload-header", "업로드 해설", "현재 데이터 업로드 화면을 해설해줘", "resource 업로드와 DB 적재 상태"),
          }}
          action={{
            label: "추천 조치",
            onClick: () => handleAssist("upload-header", "업로드 추천 조치", "업로드 화면 기준으로 지금 무엇을 해야 하는지 알려줘", "리소스 적재와 업로드 이력", "action"),
          }}
          compare={{
            label: "비교 보기",
            onClick: () => handleAssist("upload-header", "리소스 비교", "현재 선택한 리소스와 다른 리소스를 비교해서 설명해줘", selectedType),
          }}
        />

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {(sources as Array<ResourceSourceCatalog>).map((source) => (
            <button
              key={source.source_kind}
              onClick={() => setSelectedType(source.source_kind as ResourceType)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition-all",
                selectedType === source.source_kind
                  ? "border-[#CFE0FF] bg-[#EEF4FF] text-[#2454C8]"
                  : "border-[#D6E0F0] bg-white text-slate-600 hover:bg-[#F8FAFF]",
              )}
            >
              {typeLabel[source.source_kind as ResourceType]}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-4 rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">신규 파일 업로드</p>
              <p className="mt-1 text-xs text-slate-500">CSV 또는 XLSX 파일을 업로드하면 백엔드 업로드 파이프라인 작업이 생성됩니다.</p>
              <div className="mt-4 space-y-3">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EEF4FF] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={mappingPeriodStart}
                    onChange={(event) => setMappingPeriodStart(event.target.value)}
                    className="h-10 rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-primary/50"
                  />
                  <input
                    type="date"
                    value={mappingPeriodEnd}
                    onChange={(event) => setMappingPeriodEnd(event.target.value)}
                    className="h-10 rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedStore || isUploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1E5BE9] disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? "업로드 중..." : "파일 업로드"}
                </button>
                {statusMessage && (
                  <p className="text-xs font-medium text-slate-600">{statusMessage}</p>
                )}
              </div>
            </div>

            <div
              className={cn(
                "rounded-xl border-2 border-dashed p-8 text-center transition-all",
                selectedAssistCard === "upload-import"
                  ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
                  : "border-[#DCE4F3] bg-[#F7FAFF]",
              )}
            >
              <Upload className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">실데이터 적재 상태</p>
              <p className="mt-1 text-xs text-slate-400">{activeSource?.description ?? "연결된 리소스가 없습니다."}</p>
              <button 
                onClick={handleImport}
                disabled={isImporting}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 disabled:opacity-50"
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                {isImporting ? "적재 중..." : "PostgreSQL 적재(Import) 실행"}
              </button>
              <AssistActionBar
                className="mt-4"
                compact
                summary={{
                  label: "해설 보기",
                  onClick: () => handleAssist("upload-import", "적재 해설", "현재 적재 상태와 선택된 리소스를 해설해줘", activeSource?.description),
                }}
                action={{
                  label: "추천 조치",
                  onClick: () => handleAssist("upload-import", "적재 조치", "현재 적재 상태 기준으로 다음 조치를 알려줘", activeSource?.description, "action"),
                }}
                compare={{
                  label: "비교 보기",
                  onClick: () => handleAssist("upload-import", "적재 비교 보기", "현재 적재 상태를 다른 리소스와 비교해서 설명해줘", activeSource?.description),
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">매장</label>
                <select
                  value={selectedStore}
                  onChange={(event) => setSelectedStore(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-primary/50"
                >
                  {(activeSource?.stores ?? []).map((store) => (
                    <option key={store.store_key} value={store.store_key}>{store.store_key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">파일 수</label>
                <div className="flex h-10 items-center rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 shadow-sm">
                  {activeSource?.stores.find((store) => store.store_key === selectedStore)?.file_count ?? 0}건
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border p-4 shadow-sm transition-all",
              selectedAssistCard === "upload-preview"
                ? "border-[#b8ccff] bg-[#f7faff] ring-2 ring-[#d9e5ff]"
                : "border-[#DCE4F3] bg-[#F7FAFF]",
            )}
          >
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">미리보기 (상위 10행)</p>
              <AssistActionBar
                className="mt-3"
                compact
                summary={{
                  label: "해설 보기",
                  onClick: () => handleAssist("upload-preview", "미리보기 해설", "현재 데이터 미리보기를 해설해줘", `${selectedStore} / ${selectedType}`),
                }}
                action={{
                  label: "추천 조치",
                  onClick: () => handleAssist("upload-preview", "미리보기 추천 조치", "현재 데이터 미리보기 기준으로 확인할 조치를 알려줘", `${selectedStore} / ${selectedType}`, "action"),
                }}
                compare={{
                  label: "비교 보기",
                  onClick: () => handleAssist("upload-preview", "미리보기 비교 보기", "현재 데이터 미리보기를 다른 리소스와 비교해서 설명해줘", `${selectedStore} / ${selectedType}`),
                }}
              />
            </div>
            {preview ? (
              <div className="overflow-x-auto rounded-lg border border-[#DCE4F3] bg-white shadow-inner">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {preview.headers.map((header) => (
                        <th key={header} className="px-3 py-2 font-bold text-slate-500">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((row, index) => (
                      <tr key={`${selectedStore}-${index}`} className="border-t border-slate-100">
                        {preview.headers.map((header) => (
                          <td key={`${header}-${index}`} className="px-3 py-2 text-slate-700">
                            {String(row[header] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : previewError ? (
              <ErrorState title="미리보기를 불러올 수 없습니다" message={previewError} onRetry={loadData} />
            ) : (activeSource?.stores.length ?? 0) === 0 ? (
              <EmptyState
                title="선택한 리소스에 적재된 매장이 없습니다"
                description="먼저 리소스 import 또는 파일 업로드를 수행한 뒤 다시 확인해 주세요."
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-[#DCE4F3] bg-white text-sm text-slate-400 shadow-inner">
                선택된 리소스가 없습니다
              </div>
            )}
          </div>
        </div>
      </section>

      {inlineAssist && inlineAssist.cardId === "upload-header" && (
        <InlineAssistPanel
          title={inlineAssist.title}
          why={inlineAssist.why}
          actionLabel={inlineAssist.actionLabel}
        />
      )}

      {inlineAssist && (inlineAssist.cardId === "upload-import" || inlineAssist.cardId === "upload-preview") && (
        <InlineAssistPanel
          title={inlineAssist.title}
          why={inlineAssist.why}
          actionLabel={inlineAssist.actionLabel}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-border/90 bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900">업로드 이력</h3>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Recent Entries</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-[#F7FAFF] text-slate-500">
              <tr>
                <th className="border-r border-slate-100/50 py-4 pl-8 pr-4 text-[11px] font-bold uppercase tracking-wider">파일명</th>
                <th className="w-24 border-r border-slate-100/50 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider">유형</th>
                <th className="w-32 border-r border-slate-100/50 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider">매장</th>
                <th className="w-24 border-r border-slate-100/50 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider">품질</th>
                <th className="w-48 border-r border-slate-100/50 px-4 py-4 text-[11px] font-bold uppercase tracking-wider">업로드 일시</th>
                <th className="w-32 border-r border-slate-100/50 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider">상태</th>
                <th className="w-24 py-4 pl-4 pr-8 text-right text-[11px] font-bold uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {uploadHistory.map((row) => (
                <tr key={row.id} className="group font-medium transition-all hover:bg-slate-50/80">
                  <td className="border-r border-slate-100/50 py-4 pl-8 pr-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-300" />
                      <span className="font-bold text-slate-800">{row.original_filename}</span>
                    </div>
                  </td>
                  <td className="border-r border-slate-100/50 px-4 py-4 text-center text-slate-600">{row.data_type}</td>
                  <td className="border-r border-slate-100/50 px-4 py-4 text-center text-slate-600">{row.store_id}</td>
                  <td className="border-r border-slate-100/50 px-4 py-4 text-center font-mono text-xs">{row.quality_score ?? "-"}</td>
                  <td className="border-r border-slate-100/50 px-4 py-4 font-mono text-xs text-slate-500">{row.created_at.replace("T", " ").slice(0, 16)}</td>
                  <td className="border-r border-slate-100/50 px-4 py-4 text-center">
                    <span className={cn(
                      "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm",
                      row.status === "completed" ? "border-emerald-100 bg-emerald-50 text-emerald-600" :
                      row.status === "failed" ? "border-red-100 bg-red-50 text-red-600" :
                      "border-blue-100 bg-blue-50 text-primary",
                    )}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-8 text-right">
                    {row.status === "failed" && (
                      <button
                        onClick={() => handleRetry(row.id)}
                        disabled={retryingJobId === row.id}
                        className="rounded-xl border border-red-100 bg-white p-2 text-red-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
