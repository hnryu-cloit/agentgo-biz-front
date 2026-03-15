import type React from "react";
import { useState } from "react";
import { ScanLine, Upload, FileText, CheckSquare, Send, Clock, CheckCircle2 } from "lucide-react";
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

export const NoticeOcrPage: React.FC = () => {
  const [uploaded, setUploaded] = useState(true);
  const [checks, setChecks] = useState<number[]>([1, 2]);

  const toggleCheck = (id: number) => {
    setChecks((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const doneCount = checks.length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="app-card p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">운영 자동화</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">공지 OCR 및 체크리스트</h2>
            <p className="mt-1 text-base text-muted-foreground">
              공지 이미지를 업로드하면 OCR 결과와 필수 체크리스트가 자동 생성됩니다.
            </p>
          </div>
          <div className="rounded-xl bg-[#eef3ff] p-3 shadow-sm">
            <ScanLine className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* 진행 단계 */}
        <div className="mt-6 flex items-center gap-0">
          {["이미지 업로드", "OCR 분석", "체크리스트 확인", "전체 배포"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                  idx < 3 ? "bg-primary text-white" : "border border-[#d5deec] bg-card text-[var(--subtle-foreground)]"
                )}>
                  {idx < 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-xs font-semibold",
                  idx < 3 ? "text-primary" : "text-[var(--subtle-foreground)]"
                )}>
                  {step}
                </span>
              </div>
              {idx < 3 && <div className="mx-3 h-px w-8 bg-[#d5deec]" />}
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 + Step 2 */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 1. 이미지 업로드 */}
        <article className="flex flex-col app-card p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Upload className="h-5 w-5 text-[var(--subtle-foreground)]" />
            Step 1. 이미지 업로드
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">공지 원본 이미지 또는 PDF를 업로드합니다.</p>

          {uploaded ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#c9d8ff] bg-[#f4f7ff] p-4 shadow-sm transition-all hover:shadow-md">
              <div className="rounded-lg bg-[#eef3ff] p-2 shadow-sm">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">공지_2026_03_10.jpg</p>
                <p className="text-xs text-[var(--subtle-foreground)] font-medium">2.4 MB · JPG</p>
              </div>
              <button
                onClick={() => setUploaded(false)}
                className="rounded-lg border border-[#d5deec] bg-card px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-[#f4f7ff] transition-colors shadow-sm"
              >
                변경
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#d5deec] bg-[#f4f7ff] p-8 text-center transition-colors hover:border-primary/30">
              <Upload className="mx-auto h-8 w-8 text-[#b0bdd4]" />
              <p className="mt-3 text-sm font-semibold text-[#34415b]">공지 이미지를 드래그하거나 업로드하세요</p>
              <p className="mt-1 text-xs text-[var(--subtle-foreground)]">JPG · PNG · PDF 지원</p>
              <button
                onClick={() => setUploaded(true)}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                파일 선택
              </button>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">공지 대상</label>
              <select className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50">
                <option>전체 매장</option>
                <option>강남구 매장</option>
                <option>종로구 매장</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-wider">공지 날짜</label>
              <input
                type="date"
                defaultValue="2026-03-10"
                className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </article>

        {/* Step 2. OCR 결과 */}
        <article className="flex flex-col app-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ScanLine className="h-5 w-5 text-[var(--subtle-foreground)]" />
              Step 2. OCR 결과 확인
            </h3>
            <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-2.5 py-0.5 text-xs font-bold text-[#2f66ff] shadow-sm">
              신뢰도 96%
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">인식된 텍스트를 확인하고 필요 시 수정합니다.</p>

          <div className="mt-4 flex-1 space-y-2">
            {ocrLines.map((line, idx) => (
              <div key={idx} className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3 shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-[#34415b] leading-relaxed">{line.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                    <div className="h-full rounded-full bg-primary shadow-sm" style={{ width: `${line.confidence}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--subtle-foreground)] shrink-0">{line.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>

      </section>

      {/* Step 3. 체크리스트 + Step 4. 배포 현황 */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 3. 체크리스트 */}
        <article className="app-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CheckSquare className="h-5 w-5 text-[var(--subtle-foreground)]" />
              Step 3. 자동 생성 체크리스트
            </h3>
            <span className="text-xs font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">{doneCount}/{checklist.length} 완료</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all shadow-sm"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all shadow-sm hover:shadow-md",
                  checks.includes(item.id)
                    ? "border-[#c9d8ff] bg-[#eef3ff]"
                    : "border-[#d5deec] bg-[#f4f7ff] hover:border-[#bac9e3]"
                )}
              >
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors shadow-sm",
                  checks.includes(item.id) ? "border-primary bg-primary" : "border-[#d5deec] bg-card"
                )}>
                  {checks.includes(item.id) && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={cn(
                  "flex-1 text-sm font-semibold transition-colors",
                  checks.includes(item.id) ? "text-[#2f66ff]" : "text-[#34415b]"
                )}>
                  {item.task}
                </span>
                <span className="text-[11px] font-bold text-[var(--subtle-foreground)]">마감 {item.deadline}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#d5deec] bg-card px-3 py-2.5 text-sm font-bold text-[#4a5568] transition-colors hover:bg-[#f4f7ff] shadow-sm">
              임시 저장
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md">
              <span className="flex items-center justify-center gap-1.5">
                <Send className="h-4 w-4" />
                배포 실행
              </span>
            </button>
          </div>
        </article>

        {/* Step 4. 배포 현황 */}
        <article className="app-card p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Clock className="h-5 w-5 text-[var(--subtle-foreground)]" />
            Step 4. 배포 현황
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">매장별 공지 수신 및 확인 상태입니다.</p>

          <div className="mt-4 space-y-2">
            {deployHistory.map((item) => (
              <div
                key={item.store}
                className="flex items-center justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0 shadow-sm",
                    item.status === "완료" ? "bg-emerald-400" : "bg-slate-300"
                  )} />
                  <p className="text-sm font-bold text-[#1a2138]">{item.store}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[var(--subtle-foreground)] font-mono">{item.time}</span>
                  <span className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                    item.status === "완료"
                      ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                      : "border-[#d5deec] bg-card text-[var(--subtle-foreground)]"
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#c9d8ff] bg-[#f4f7ff] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-primary">배포 완료율</span>
              <span className="text-foreground">
                {deployHistory.filter((d) => d.status === "완료").length}/{deployHistory.length} 매장 ({Math.round((deployHistory.filter((d) => d.status === "완료").length / deployHistory.length) * 100)}%)
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
              <div
                className="h-full rounded-full bg-primary shadow-sm transition-all duration-700"
                style={{ width: `${(deployHistory.filter((d) => d.status === "완료").length / deployHistory.length) * 100}%` }}
              />
            </div>
          </div>
        </article>

      </section>
    </div>
  );
};
