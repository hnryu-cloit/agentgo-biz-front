import type React from "react";
import { useState } from "react";
import { Users, TrendingDown, Crown, AlertCircle, Filter, Send } from "lucide-react";

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
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">고객 세그먼트 (RFM)</h2>
        <p className="mt-1 text-sm text-slate-500">
          최근성·빈도·금액 기준으로 고객을 분류하고 이탈 위험 고객을 관리합니다.
        </p>
      </section>

      {/* Segment KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {segments.map((seg) => {
          return (
            <article
              key={seg.key}
              onClick={() => setSelected(selected === seg.key ? null : seg.key)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                selected === seg.key
                  ? seg.borderColor + " ring-2 ring-offset-1 ring-primary/30"
                  : "border-border/90 bg-card hover:border-[#DCE4F3]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{seg.label}</p>
                {segmentIcons[seg.key]}
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{seg.count.toLocaleString()}명</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>매출 기여 {seg.salesShare}%</span>
                <span>·</span>
                <span>평균 방문 {seg.avgVisit}회/월</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Segment Detail */}
      {activeSegment && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="text-lg font-bold text-slate-900">{activeSegment.label} 상세</h3>
          <p className="mt-0.5 text-sm text-slate-500">{activeSegment.description}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
              <p className="text-xs font-medium text-slate-400">고객 수</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{activeSegment.count.toLocaleString()}명</p>
            </div>
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
              <p className="text-xs font-medium text-slate-400">매출 기여</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{activeSegment.salesShare}%</p>
            </div>
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
              <p className="text-xs font-medium text-slate-400">평균 방문 빈도</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{activeSegment.avgVisit}회/월</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${activeSegment.salesShare}%` }}
            />
          </div>
        </section>
      )}

      {/* Churn Risk List */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">이탈 고객 후보 리스트</h3>
            <p className="mt-0.5 text-sm text-slate-500">방문 지연 고객 리스트 — 위험 점수 순 정렬</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-600 hover:bg-[#F8FAFF]">
              <Filter className="h-3.5 w-3.5" />
              필터
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3">고객 ID</th>
                <th className="px-4 py-3">등급</th>
                <th className="px-4 py-3">미방문</th>
                <th className="px-4 py-3">위험 점수</th>
                <th className="px-4 py-3">예상 LTV</th>
                <th className="px-4 py-3 text-right">오퍼 제외</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-border ${c.excluded ? "opacity-40" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-800">{c.id}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.grade === "VIP" ? "border border-purple-200 bg-purple-50 text-purple-700" : "border border-[#DCE4F3] bg-white text-slate-600"
                    }`}>
                      {c.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${c.daysSince >= 45 ? "text-red-600" : "text-amber-600"}`}>
                      {c.daysSince}일
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#DCE4F3]">
                        <div
                          className={`h-full rounded-full ${c.riskScore >= 85 ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${c.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{c.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.predictedLtv.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExclude(c.id)}
                      className={`rounded border px-2 py-1 text-xs transition-colors ${
                        c.excluded
                          ? "border-[#D6E0F0] bg-white text-slate-600"
                          : "border-red-200 bg-red-50 text-red-600"
                      }`}
                    >
                      {c.excluded ? "포함" : "제외"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Send Offer */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
          <p className="text-sm text-slate-600">
            선택 대상 <strong className="text-primary">{targetCount}명</strong>에게 오퍼를 발송합니다.
          </p>
          {sentOffer ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <AlertCircle className="h-4 w-4" />
              발송 완료
            </span>
          ) : (
            <button
              onClick={() => setSentOffer(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
              캠페인 연계 발송
            </button>
          )}
        </div>
      </section>
    </div>
  );
};