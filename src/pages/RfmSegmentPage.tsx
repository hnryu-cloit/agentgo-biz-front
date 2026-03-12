import type React from "react";
import { useState } from "react";
import { Users, TrendingDown, Crown, AlertCircle, Filter, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type SegmentKey = "vip" | "loyal" | "at_risk" | "churned";

const segmentIcons: Record<SegmentKey, React.ReactNode> = {
  vip: <Crown className="h-5 w-5 text-purple-600" />,
  loyal: <Users className="h-5 w-5 text-primary" />,
  at_risk: <AlertCircle className="h-5 w-5 text-amber-600" />,
  churned: <TrendingDown className="h-5 w-5 text-red-500" />,
};

type Segment = {
  key: SegmentKey;
  label: string;
  count: number;
  salesShare: number;
  avgVisit: number;
  color: string;
  borderColor: string;
  description: string;
};

const segments: Segment[] = [
  {
    key: "vip",
    label: "VIP 고객",
    count: 284,
    salesShare: 38,
    avgVisit: 8.2,
    color: "text-purple-700",
    borderColor: "border-purple-200 bg-purple-50",
    description: "최근 30일 내 방문 3회↑, 객단가 상위 20%",
  },
  {
    key: "loyal",
    label: "우수 고객",
    count: 841,
    salesShare: 32,
    avgVisit: 3.1,
    color: "text-primary",
    borderColor: "border-[#BFD4FF] bg-[#EEF4FF]",
    description: "꾸준한 방문 패턴, 브랜드 충성도 높음",
  },
  {
    key: "at_risk",
    label: "이탈 우려",
    count: 312,
    salesShare: 22,
    avgVisit: 0.8,
    color: "text-amber-700",
    borderColor: "border-amber-200 bg-amber-50",
    description: "30~60일 미방문, 이탈 징후 감지",
  },
  {
    key: "churned",
    label: "이탈 고객",
    count: 198,
    salesShare: 8,
    avgVisit: 0,
    color: "text-red-700",
    borderColor: "border-red-200 bg-red-50",
    description: "60일 이상 미방문, 재활성화 필요",
  },
];

type ChurnCustomer = {
  id: string;
  grade: string;
  daysSince: number;
  riskScore: number;
  predictedLtv: number;
  excluded: boolean;
};

const churnList: ChurnCustomer[] = [
  { id: "C-1042", grade: "VIP", daysSince: 38, riskScore: 94, predictedLtv: 420000, excluded: false },
  { id: "C-2817", grade: "우수", daysSince: 44, riskScore: 87, predictedLtv: 280000, excluded: false },
  { id: "C-0391", grade: "일반", daysSince: 52, riskScore: 81, predictedLtv: 95000, excluded: false },
  { id: "C-1765", grade: "VIP", daysSince: 61, riskScore: 76, predictedLtv: 540000, excluded: false },
  { id: "C-3204", grade: "일반", daysSince: 33, riskScore: 72, predictedLtv: 62000, excluded: false },
];

export const RfmSegmentPage: React.FC = () => {
  const [selected, setSelected] = useState<SegmentKey | null>(null);
  const [customers, setCustomers] = useState(churnList);
  const [sentOffer, setSentOffer] = useState(false);

  const activeSegment = segments.find((s) => s.key === selected);

  const toggleExclude = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, excluded: !c.excluded } : c))
    );
  };

  const targetCount = customers.filter((c) => !c.excluded).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <h2 className="text-2xl font-bold text-slate-900">고객 세그먼트 (RFM)</h2>
        <p className="mt-1 text-base text-slate-500">
          최근성·빈도·금액 기준으로 고객을 분류하고 AI 기반 이탈 위험군을 정밀 관리합니다.
        </p>
      </section>

      {/* Segment KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {segments.map((seg) => {
          const isActive = selected === seg.key;
          return (
            <article
              key={seg.key}
              onClick={() => setSelected(isActive ? null : seg.key)}
              className={cn(
                "cursor-pointer rounded-2xl border p-5 transition-all shadow-elevated hover:shadow-md",
                isActive
                  ? cn(seg.borderColor, "ring-2 ring-offset-2 ring-primary/40 scale-[1.02]")
                  : "border-border/90 bg-card hover:border-[#DCE4F3]"
              )}
            >
              <div className="flex items-center justify-between">
                <p className={cn("text-sm font-bold uppercase tracking-wider", isActive ? seg.color : "text-slate-500")}>
                  {seg.label}
                </p>
                <div className={cn("rounded-lg p-1.5 shadow-sm bg-white/50", isActive ? "" : "bg-slate-50")}>
                  {segmentIcons[seg.key]}
                </div>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-900 leading-none">
                {seg.count.toLocaleString()}<span className="text-sm ml-1 font-bold text-slate-400">명</span>
              </p>
              <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">매출 기여도</span>
                  <span className="text-slate-700">{seg.salesShare}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-primary/60" style={{ width: `${seg.salesShare}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Segment Detail */}
      {activeSegment && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("rounded-lg p-1.5 shadow-sm bg-white border border-slate-100")}>
              {segmentIcons[activeSegment.key]}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{activeSegment.label} 분석 상세</h3>
          </div>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">{activeSegment.description}</p>
          
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Customers</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{activeSegment.count.toLocaleString()}명</p>
            </div>
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Share</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{activeSegment.salesShare}%</p>
            </div>
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Frequency</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{activeSegment.avgVisit}회<span className="text-xs ml-1">/월</span></p>
            </div>
          </div>
        </section>
      )}

      {/* Churn Risk List */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-1.5 shadow-sm">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">이탈 위험군 집중 관리</h3>
              <p className="text-xs font-medium text-slate-400">방문 지연 기간 및 위험 점수 기반 정렬</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-[#F8FAFF] shadow-sm transition-colors">
            <Filter className="h-3.5 w-3.5" />
            데이터 필터
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">고객 ID</th>
                <th className="px-4 py-3 font-bold text-center">현재 등급</th>
                <th className="px-4 py-3 font-bold text-center">미방문 기간</th>
                <th className="px-4 py-3 font-bold">AI 위험 점수</th>
                <th className="px-4 py-3 font-bold">예상 LTV</th>
                <th className="px-4 py-3 text-right font-bold">액션</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-t border-border transition-all hover:bg-slate-50/50 font-medium",
                    c.excluded ? "opacity-40 grayscale" : ""
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#2454C8]">{c.id}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-black shadow-sm border",
                      c.grade === "VIP" 
                        ? "border-purple-200 bg-purple-50 text-purple-700" 
                        : "border-[#DCE4F3] bg-white text-slate-500"
                    )}>
                      {c.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "text-sm font-bold",
                      c.daysSince >= 45 ? "text-red-600" : "text-amber-600"
                    )}>
                      {c.daysSince}<span className="text-[10px] ml-0.5">일</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <div
                          className={cn(
                            "h-full rounded-full shadow-sm transition-all duration-700",
                            c.riskScore >= 85 ? "bg-red-500" : "bg-amber-500"
                          )}
                          style={{ width: `${c.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700 font-mono">{c.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-bold font-mono">{c.predictedLtv.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExclude(c.id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-black transition-all shadow-sm",
                        c.excluded
                          ? "border-[#D6E0F0] bg-white text-slate-400"
                          : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                      )}
                    >
                      {c.excluded ? "포함시키기" : "제외하기"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Send Offer Panel */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#CFE0FF]">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              최종 타겟팅 대상 <strong className="text-[#2454C8] text-lg mx-0.5">{targetCount}명</strong>
            </p>
          </div>
          {sentOffer ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-white shadow-md animate-in slide-in-from-right-4 duration-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-black">캠페인 발송 완료</span>
            </div>
          ) : (
            <button
              onClick={() => setSentOffer(true)}
              className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              맞춤 오퍼 발송하기
            </button>
          )}
        </div>
      </section>
    </div>
  );
};