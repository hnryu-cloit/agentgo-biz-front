import type React from "react";
import { useState } from "react";
import { ScanLine, Upload, FileText, CheckSquare, Send, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ocrLines = [
  { text: "3월 10일(화)까지 테이크아웃 포트 A/B 전체 교체 실시", confidence: 98 },
  { text: "교체 완료 후 POS 메뉴 반영 필수 — 미반영 시 주문 오류 발생", confidence: 95 },
  { text: "점포별 담당자 서명 후 본사 시스템 업로드 요망", confidence: 91 },
  { text: "신규 포장재 입고 수량 확인 및 부족분 즉시 발주", confidence: 87 },
];

const checklist = [
  { id: 1, task: "POS 메뉴 교체", deadline: "3/9", done: true },
  { id: 2, task: "점포별 공지 확인 서명", deadline: "3/9", done: true },
  { id: 3, task: "신규 포장재 입고 수량 확인", deadline: "3/10", done: false },
  { id: 4, task: "본사 시스템 업로드", deadline: "3/10", done: false },
];

const deployHistory = [
  { store: "A매장", status: "완료", time: "14:20" },
  { store: "B매장", status: "완료", time: "14:21" },
  { store: "C매장", status: "대기중", time: "-" },
  { store: "D매장", status: "대기중", time: "-" },
];

const steps = ["이미지 업로드", "AI OCR 분석", "체크리스트 확인", "전사 배포"];

export const NoticeOcrPage: React.FC = () => {
  const [uploaded, setUploaded] = useState(true);
  const [checks, setChecks] = useState<number[]>([1, 2]);

  const toggleCheck = (id: number) => {
    setChecks((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const doneCount = checks.length;
  const currentStep = 2; // 0-based: 체크리스트 단계 진행 중

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
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">완료</span>
            </div>

            {uploaded ? (
              <div className="rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#d5deec]">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">공지_2026_03_10.jpg</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">2.4 MB · 고해상도</p>
                </div>
                <button
                  onClick={() => setUploaded(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setUploaded(true)}
                className="rounded-xl border-2 border-dashed border-[#d5deec] bg-[#f4f7ff] p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-[#eef3ff] transition-all"
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm font-medium text-foreground">이미지 또는 PDF 드래그</p>
                <p className="mt-1 text-xs text-muted-foreground">클릭하여 파일 선택</p>
              </div>
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
                <p className="text-[10px] font-semibold text-muted-foreground">{doneCount}/{checklist.length} 완료</p>
                <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[#e8edf5]">
                  <div className="h-full bg-emerald-500" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all",
                    checks.includes(item.id)
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[#d5deec] bg-[#f4f7ff] hover:border-[#b8ccff] hover:bg-[#eef3ff]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-all",
                      checks.includes(item.id)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-[#d5deec] bg-card"
                    )}>
                      {checks.includes(item.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={cn("text-sm font-medium", checks.includes(item.id) ? "text-emerald-700" : "text-foreground")}>
                      {item.task}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">~{item.deadline}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-lg border border-[#d5deec] bg-card px-3 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
                임시 저장
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5BE9] shadow-sm transition-colors">
                <Send className="h-4 w-4" /> 전사 배포
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
                  <span className="text-lg font-bold text-foreground">96%</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e8edf5]">
                    <div className="h-full bg-primary" style={{ width: "96%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-5">
              {ocrLines.map((line, idx) => (
                <div key={idx} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground leading-relaxed flex-1">"{line.text}"</p>
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{line.confidence}%</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {idx === 0 && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">우선 처리</span>}
                    {idx === 1 && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">POS 연동</span>}
                  </div>
                </div>
              ))}
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
                <span className="text-sm font-semibold text-foreground">2/4 완료</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: "50%" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {deployHistory.map((item) => (
                <div
                  key={item.store}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3",
                    item.status === "완료"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[#d5deec] bg-[#f4f7ff]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "완료" ? "bg-emerald-500" : "bg-[#c5d0e0]"
                    )} />
                    <span className="text-sm font-medium text-foreground">{item.store}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs font-semibold",
                      item.status === "완료" ? "text-emerald-600" : "text-muted-foreground"
                    )}>{item.status}</span>
                    {item.time !== "-" && (
                      <p className="text-[10px] text-muted-foreground">{item.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI 인사이트 */}
            <div className="mt-4 rounded-xl border border-[#c9d8ff] bg-[#eef3ff] px-4 py-3">
              <p className="text-xs font-medium leading-relaxed text-foreground">
                <span className="font-bold text-primary">AI 분석:</span>{" "}
                C·D 매장은 아직 배포 대기 중입니다. 마감일(3/10) 이전에 담당자에게 재확인을 권고합니다.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
