import type React from "react";
import { useState } from "react";
import { ScanLine, Upload, FileText, CheckSquare, Send, Clock, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="h-4 w-4 text-primary" />
            <span className="ds-eyebrow">Vision Intelligence</span>
          </div>
          <h1 className="ds-page-title">공지 OCR 및 자동화 <span className="text-muted-foreground font-light">|</span> 체크리스트</h1>
        </div>
        <button className="ds-button ds-button-outline h-11 px-6 !text-xs uppercase tracking-widest font-black">
          <Layers className="h-4 w-4 mr-2" />
          Model Config
        </button>
      </div>

      {/* Step Indicator */}
      <section className="ds-card p-1">
        <div className="flex items-center justify-between px-10 py-6">
          {["이미지 업로드", "AI OCR 분석", "체크리스트 확인", "전사 배포"].map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 group">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black transition-all",
                  idx < 3 ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-panel-soft text-muted-foreground"
                )}>
                  {idx < 2 ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-tighter mt-2 transition-colors",
                  idx < 3 ? "text-primary" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
              {idx < 3 && <div className={cn("flex-1 h-0.5 mx-6 rounded-full", idx < 2 ? "bg-primary/20" : "bg-panel-soft")} />}
            </div>
          ))}
        </div>
      </section>

      {/* Steps Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Step 1 */}
          <article className="ds-card p-8 border-primary/5">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <h3 className="ds-section-title text-base flex items-center gap-3">
                <Upload className="h-5 w-5 text-primary" />
                Step 1. 소스 데이터 업로드
              </h3>
              <span className="ds-badge ds-badge-info">Ready</span>
            </div>

            {uploaded ? (
              <div className="p-6 ds-ai-panel border-none shadow-none group">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:rotate-3 transition-transform">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate uppercase">공지_2026_03_10.jpg</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">2.4 MB · High Resolution</p>
                  </div>
                  <button onClick={() => setUploaded(false)} className="ds-button ds-button-ghost !h-10 !w-10 !p-0"><RefreshCw className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-border bg-panel-soft/30 p-12 text-center hover:border-primary/40 transition-all cursor-pointer group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                <p className="text-sm font-black text-foreground">Drop Image or PDF here</p>
                <button onClick={() => setUploaded(true)} className="ds-button ds-button-primary h-10 px-8 mt-8 uppercase tracking-widest font-black text-[10px]">Select File</button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="ds-eyebrow !text-[9px] ml-1">Target Zone</label>
                <select className="ds-input w-full bg-panel-soft/50 border-none font-black text-xs uppercase">
                  <option>Global (All)</option>
                  <option>Seoul North</option>
                  <option>Seoul South</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="ds-eyebrow !text-[9px] ml-1">Due Date</label>
                <input type="date" defaultValue="2026-03-10" className="ds-input w-full bg-panel-soft/50 border-none font-black text-xs" />
              </div>
            </div>
          </article>

          {/* Step 3 */}
          <article className="ds-card p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <h3 className="ds-section-title text-base flex items-center gap-3 text-emerald-600">
                <CheckSquare className="h-5 w-5" />
                Step 3. AI Generated Checklist
              </h3>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase">{doneCount}/{checklist.length} Verified</p>
                <div className="w-20 h-1 bg-panel-soft rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-500" style={{ width: `${(doneCount/checklist.length)*100}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group",
                    checks.includes(item.id) ? "bg-emerald-50 border-emerald-200" : "bg-white border-border hover:border-emerald-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      checks.includes(item.id) ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white border-border group-hover:border-emerald-400"
                    )}>
                      {checks.includes(item.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className={cn("text-sm font-black italic", checks.includes(item.id) ? "text-emerald-700" : "text-foreground")}>{item.task}</span>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase font-mono">D-{item.deadline.split('/')[1]}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button className="ds-button ds-button-outline uppercase tracking-widest font-black text-[10px]">Archive Draft</button>
              <button className="ds-button ds-button-primary bg-ai-gradient border-none shadow-2xl shadow-primary/30 uppercase tracking-widest font-black text-[10px]">
                <Send className="h-4 w-4 mr-2" /> Publish Now
              </button>
            </div>
          </article>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 2 */}
          <article className="ds-card overflow-hidden flex flex-col h-full">
            <div className="p-8 ds-ai-panel border-none rounded-none flex items-center justify-between border-b border-primary/10">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3">
                  <ScanLine className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="ds-section-title text-xl">Step 2. AI OCR 분석 엔진</h3>
                  <p className="ds-eyebrow !text-[9px] mt-1 text-primary/60">Engine: AgentGo-Vision v2.4 (Neural Optimized)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="ds-eyebrow !text-[9px] mb-2 opacity-60">Confidence Score</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-foreground italic leading-none">96%</span>
                  <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-ai-gradient" style={{ width: "96%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-6 flex-1 bg-white">
              {ocrLines.map((line, idx) => (
                <div key={idx} className="group relative">
                  <div className="p-6 bg-panel-soft/30 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white transition-all hover:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-primary uppercase italic font-mono">Conf: {line.confidence}%</span>
                    </div>
                    <p className="text-base font-black text-foreground leading-relaxed italic tracking-tight">"{line.text}"</p>
                    <div className="mt-4 flex gap-2">
                      {idx === 0 && <span className="ds-badge ds-badge-danger border-none">Priority</span>}
                      {idx === 1 && <span className="ds-badge ds-badge-info border-none">POS Logic</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-panel-soft/50 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-black text-muted-foreground uppercase tracking-widest italic">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Direct Edit Mode Enabled
              </div>
              <button className="ds-button ds-button-ghost !h-9 !px-4 !text-[10px] uppercase font-black tracking-widest underline decoration-primary/20 hover:text-primary">Manual Verification →</button>
            </div>
          </article>

          {/* Step 4 */}
          <article className="ds-card p-8">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="ds-section-title text-base uppercase tracking-widest italic">Step 4. Live Propagation Tracking</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="ds-eyebrow !text-[9px] opacity-60 mb-1">Global Coverage</p>
                  <p className="text-lg font-black text-foreground italic">50% <span className="text-xs font-normal text-muted-foreground"> (2/4 Nodes)</span></p>
                </div>
                <button className="ds-button ds-button-ghost !h-10 !w-10 !p-0"><RefreshCw className="h-4 w-4 text-primary" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {deployHistory.map((item) => (
                <div key={item.store} className="p-5 bg-panel-soft/20 rounded-2xl border border-border/40 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "완료" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-400"
                    )} />
                    <span className="text-sm font-black text-foreground uppercase tracking-tighter italic">{item.store}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "ds-badge border-none shadow-sm",
                      item.status === "완료" ? "ds-badge-success" : "bg-white text-muted-foreground"
                    )}>{item.status}</span>
                    <p className="text-[9px] font-black text-muted-foreground/40 mt-2 font-mono uppercase italic">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
