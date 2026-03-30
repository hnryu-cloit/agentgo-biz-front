import type React from "react";
import { useState, useEffect } from "react";
import { ScanLine, Upload, FileText, CheckSquare, Send, Clock, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { reprocessOcr, uploadNotice, getNotice, distributeNotice, getNotices } from "@/services/hq";
import type { NoticeResponse } from "@/types/api";

const steps = ["이미지 업로드", "AI OCR 분석", "체크리스트 확인", "전사 배포"];

export const NoticeOcrPage: React.FC = () => {
  const [uploaded, setUploaded] = useState(false);
  const [notice, setNotice] = useState<NoticeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [checks, setChecks] = useState<number[]>([]);

  // 최근 공지 하나 가져오기 (초기 상태용)
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    getNotices().then(list => {
      if (list.length > 0) {
        const latest = list[0];
        setNotice(latest);
        setUploaded(true);
        if (latest.checklist) {
          setChecks([]);
        }
      }
    }).catch((error) => {
      setLoadError(error instanceof Error ? error.message : "공지 OCR 데이터를 불러오지 못했습니다.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await uploadNotice(selectedFile, selectedFile.name);
        setNotice(res);
        setUploaded(true);
        // 분석 대기 (간단히 3초 후 다시 조회)
        setTimeout(() => {
          getNotice(res.id).then(setNotice);
        }, 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDistribute = async () => {
    if (!notice) return;
    setIsDistributing(true);
    try {
      await distributeNotice(notice.id, { store_ids: ["ALL"] });
      const updated = await getNotice(notice.id);
      setNotice(updated);
      alert("전사 배포가 완료되었습니다.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDistributing(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setChecks((prev) => prev.includes(idx) ? prev.filter((c) => c !== idx) : [...prev, idx]);
  };

  const handleReprocess = async () => {
    if (!notice) return;
    setIsReprocessing(true);
    try {
      await reprocessOcr(notice.id);
      const refreshed = await getNotice(notice.id);
      setNotice(refreshed);
    } finally {
      setIsReprocessing(false);
    }
  };

  const checklistItems = notice?.checklist ?? [];
  const doneCount = checks.length;
  const currentStep = notice?.distributed_at ? 3 : notice?.ocr_status === "completed" ? 2 : notice ? 1 : 0;

  if (isLoading) {
    return <LoadingState message="공지 OCR 화면을 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="공지 OCR 데이터를 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 pb-10">

      {/* 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <ScanLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Vision Intelligence</p>
              <h1 className="text-xl font-bold text-foreground">공지 OCR 자동화</h1>
            </div>
          </div>

          {/* 진행 단계 */}
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    idx < currentStep
                      ? "bg-primary text-white"
                      : idx === currentStep
                      ? "bg-primary text-white"
                      : "border border-[#d5deec] bg-card text-muted-foreground"
                  )}>
                    {idx < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span className={cn(
                    "hidden text-xs font-medium md:block",
                    idx <= currentStep ? "text-primary" : "text-muted-foreground"
                  )}>{step}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("mx-2 h-px w-6", idx < currentStep ? "bg-primary/40" : "bg-[#d5deec]")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 메인 그리드 */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* 왼쪽 열 */}
        <div className="lg:col-span-5 space-y-6">

          {/* Step 1: 업로드 */}
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Step 1. 소스 데이터 업로드</h2>
              </div>
              {uploaded && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">완료</span>}
            </div>

            {uploaded && notice ? (
              <div className="rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#d5deec]">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{notice.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">ID: {notice.id.slice(0,8)} · {notice.ocr_status.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => void handleReprocess()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isReprocessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <label className="block rounded-xl border-2 border-dashed border-[#d5deec] bg-[#f4f7ff] p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-[#eef3ff] transition-all">
                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                {isUploading ? (
                  <Loader2 className="mx-auto h-8 w-8 text-primary mb-3 animate-spin" />
                ) : (
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-40" />
                )}
                <p className="text-sm font-medium text-foreground">{isUploading ? "업로드 중..." : "이미지 또는 PDF 드래그"}</p>
                <p className="mt-1 text-xs text-muted-foreground">클릭하여 파일 선택</p>
              </label>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">대상 권역</label>
                <select className="w-full rounded-lg border border-[#d5deec] bg-[#f4f7ff] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option>전체</option>
                  <option>수도권 북부</option>
                  <option>수도권 남부</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">마감일</label>
                <input
                  type="date"
                  defaultValue="2026-03-10"
                  className="w-full rounded-lg border border-[#d5deec] bg-[#f4f7ff] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </article>

          {/* Step 3: 체크리스트 */}
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Step 3. AI 체크리스트</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground">{doneCount}/{checklistItems.length} 완료</p>
                <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[#e8edf5]">
                  <div className="h-full bg-emerald-500" style={{ width: `${checklistItems.length > 0 ? (doneCount / checklistItems.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {checklistItems.length > 0 ? checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all",
                    checks.includes(idx)
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[#d5deec] bg-[#f4f7ff] hover:border-[#b8ccff] hover:bg-[#eef3ff]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-all",
                      checks.includes(idx)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-[#d5deec] bg-card"
                    )}>
                      {checks.includes(idx) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={cn("text-sm font-medium", checks.includes(idx) ? "text-emerald-700" : "text-foreground")}>
                      {item}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">~03/10</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">분석된 체크리스트가 없습니다.</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-lg border border-[#d5deec] bg-card px-3 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
                임시 저장
              </button>
              <button 
                onClick={handleDistribute}
                disabled={!notice || isDistributing || currentStep < 2}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5BE9] shadow-sm transition-colors disabled:opacity-50"
              >
                {isDistributing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} 전사 배포
              </button>
            </div>
          </article>
        </div>

        {/* 오른쪽 열 */}
        <div className="lg:col-span-7 space-y-6">

          {/* Step 2: OCR 결과 */}
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <ScanLine className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Step 2. AI OCR 분석 결과</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">AgentGo-Vision v2.4</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-semibold text-muted-foreground">신뢰도</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{notice?.ocr_confidence ? Math.round(notice.ocr_confidence * 100) : 0}%</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e8edf5]">
                    <div className="h-full bg-primary" style={{ width: `${(notice?.ocr_confidence ?? 0) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {notice?.ocr_status === "processing" ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">AI가 공지 내용을 분석하고 있습니다...</p>
                </div>
              ) : notice?.summary ? (
                <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-4">
                   <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">공지 요약</p>
                   <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">{notice.summary}</p>
                </div>
              ) : (
                <EmptyState title="분석 결과가 없습니다" description="공지 파일을 업로드하면 OCR 결과와 요약이 여기에 표시됩니다." />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/50 bg-gray-50/50 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                직접 편집 모드 활성화
              </div>
              <button className="text-xs font-medium text-primary hover:underline">수동 검증 →</button>
            </div>
          </article>

          {/* Step 4: 배포 현황 */}
          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#eef3ff] p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Step 4. 전사 배포 현황</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {notice?.distributed_at ? "배포 완료" : "배포 전"}
                </span>
                <button 
                  onClick={() => notice && getNotice(notice.id).then(setNotice)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: notice?.distributed_at ? "100%" : "0%" }} />
            </div>

            <div className="p-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff] text-center">
              {notice?.distributed_at ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-semibold text-foreground">전체 가맹점에 공지가 전송되었습니다.</p>
                  <p className="text-xs text-muted-foreground">{new Date(notice.distributed_at).toLocaleString()} 배포됨</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4">배포 버튼을 누르면 전체 매장 및 담당 슈퍼바이저에게 전달됩니다.</p>
              )}
            </div>

            {/* AI 인사이트 */}
            {notice?.distributed_at && (
              <div className="mt-4 rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3">
                <p className="text-xs font-medium leading-relaxed text-foreground">
                  <span className="font-bold text-primary">AI 분석:</span>{" "}
                  공지가 성공적으로 배포되었습니다. 점주들이 체크리스트를 완료하는 즉시 '공지 이행 현황' 대시보드에서 확인할 수 있습니다.
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};
