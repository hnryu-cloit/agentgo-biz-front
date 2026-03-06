import type React from "react";
import { useState } from "react";
import { ScanLine, Upload, FileText, CheckSquare, Send, Clock, CheckCircle2 } from "lucide-react";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">운영 자동화</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">공지 OCR 및 체크리스트</h2>
            <p className="mt-1 text-base text-slate-500">
              공지 이미지를 업로드하면 OCR 결과와 필수 체크리스트가 자동 생성됩니다.
            </p>
          </div>
          <div className="rounded-xl bg-[#EEF4FF] p-3">
            <ScanLine className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* 진행 단계 */}
        <div className="mt-6 flex items-center gap-0">
          {["이미지 업로드", "OCR 분석", "체크리스트 확인", "전체 배포"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  idx < 3 ? "bg-primary text-white" : "border border-[#DCE4F3] bg-white text-slate-400"
                }`}>
                  {idx < 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium ${idx < 3 ? "text-primary" : "text-slate-400"}`}>
                  {step}
                </span>
              </div>
              {idx < 3 && <div className="mx-3 h-px w-8 bg-[#DCE4F3]" />}
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 + Step 2 */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 1. 이미지 업로드 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Upload className="h-5 w-5 text-slate-400" />
            Step 1. 이미지 업로드
          </h3>
          <p className="mt-1 text-sm text-slate-500">공지 원본 이미지 또는 PDF를 업로드합니다.</p>

          {uploaded ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <div className="rounded-lg bg-[#EEF4FF] p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">공지_2026_03_10.jpg</p>
                <p className="text-xs text-slate-400">2.4 MB · JPG</p>
              </div>
              <button
                onClick={() => setUploaded(false)}
                className="rounded border border-[#D6E0F0] bg-white px-2 py-1 text-xs text-slate-500 hover:bg-[#F8FAFF]"
              >
                변경
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#DCE4F3] bg-[#F7FAFF] p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">공지 이미지를 드래그하거나 업로드하세요</p>
              <p className="mt-1 text-xs text-slate-400">JPG · PNG · PDF 지원</p>
              <button
                onClick={() => setUploaded(true)}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                파일 선택
              </button>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">공지 대상</label>
              <select className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary/50">
                <option>전체 매장</option>
                <option>강남구 매장</option>
                <option>종로구 매장</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">공지 날짜</label>
              <input
                type="date"
                defaultValue="2026-03-10"
                className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </article>

        {/* Step 2. OCR 결과 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ScanLine className="h-5 w-5 text-slate-400" />
              Step 2. OCR 결과 확인
            </h3>
            <span className="rounded border border-[#BFD4FF] bg-[#EEF4FF] px-2 py-0.5 text-xs font-semibold text-primary">
              신뢰도 96%
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">인식된 텍스트를 확인하고 필요 시 수정합니다.</p>

          <div className="mt-4 flex-1 space-y-2">
            {ocrLines.map((line, idx) => (
              <div key={idx} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                <p className="text-sm text-slate-700 leading-relaxed">{line.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#DCE4F3]">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${line.confidence}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{line.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>

      </section>

      {/* Step 3. 체크리스트 + Step 4. 배포 현황 */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 3. 체크리스트 */}
        <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CheckSquare className="h-5 w-5 text-slate-400" />
              Step 3. 자동 생성 체크리스트
            </h3>
            <span className="text-sm text-slate-500">{doneCount}/{checklist.length} 완료</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  checks.includes(item.id)
                    ? "border-[#BFD4FF] bg-[#EEF4FF]"
                    : "border-[#DCE4F3] bg-[#F7FAFF] hover:border-[#BFD1ED]"
                }`}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  checks.includes(item.id) ? "border-primary bg-primary" : "border-[#DCE4F3] bg-white"
                }`}>
                  {checks.includes(item.id) && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`flex-1 text-sm font-medium ${checks.includes(item.id) ? "text-primary" : "text-slate-700"}`}>
                  {item.task}
                </span>
                <span className="text-xs text-slate-400">마감 {item.deadline}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F8FAFF]">
              임시 저장
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              <span className="flex items-center justify-center gap-1.5">
                <Send className="h-4 w-4" />
                배포 실행
              </span>
            </button>
          </div>
        </article>

        {/* Step 4. 배포 현황 */}
        <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Clock className="h-5 w-5 text-slate-400" />
            Step 4. 배포 현황
          </h3>
          <p className="mt-1 text-sm text-slate-500">매장별 공지 수신 및 확인 상태입니다.</p>

          <div className="mt-4 space-y-2">
            {deployHistory.map((item) => (
              <div
                key={item.store}
                className="flex items-center justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    item.status === "완료" ? "bg-emerald-400" : "bg-slate-300"
                  }`} />
                  <p className="text-sm font-medium text-slate-900">{item.store}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{item.time}</span>
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${
                    item.status === "완료"
                      ? "border-[#BFD4FF] bg-[#EEF4FF] text-primary"
                      : "border-[#DCE4F3] bg-white text-slate-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">배포 완료</span>
              <span className="font-bold text-slate-900">
                {deployHistory.filter((d) => d.status === "완료").length}/{deployHistory.length} 매장
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(deployHistory.filter((d) => d.status === "완료").length / deployHistory.length) * 100}%` }}
              />
            </div>
          </div>
        </article>

      </section>
    </div>
  );
};
