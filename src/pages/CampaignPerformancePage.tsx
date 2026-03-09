import type React from "react";
import { useMemo, useState } from "react";
import { BarChart2, Download, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

type Channel = "전체" | "앱푸시" | "알림톡" | "이메일";

type Campaign = {
  id: string;
  name: string;
  channel: Exclude<Channel, "전체">;
  segment: string;
  startDate: string;
  endDate: string;
  sent: number;
  opened: number;
  used: number;
  revisited: number;
  revenue: number;
};

const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "3월 이탈방지 쿠폰",
    channel: "알림톡",
    segment: "이탈 우려",
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    sent: 312,
    opened: 234,
    used: 98,
    revisited: 74,
    revenue: 682000,
  },
  {
    id: "c2",
    name: "VIP 감사 포인트",
    channel: "앱푸시",
    segment: "VIP",
    startDate: "2026-02-20",
    endDate: "2026-02-28",
    sent: 284,
    opened: 251,
    used: 189,
    revisited: 142,
    revenue: 1840000,
  },
  {
    id: "c3",
    name: "주말 세트 프로모션",
    channel: "이메일",
    segment: "우수",
    startDate: "2026-02-10",
    endDate: "2026-02-16",
    sent: 841,
    opened: 421,
    used: 184,
    revisited: 130,
    revenue: 920000,
  },
];

const channels: Channel[] = ["전체", "앱푸시", "알림톡", "이메일"];

export const CampaignPerformancePage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel>("전체");
  const [period, setPeriod] = useState("2026-02");

  const filtered = useMemo(
    () => campaigns.filter((c) => activeChannel === "전체" || c.channel === activeChannel),
    [activeChannel],
  );

  const { totalRevenue, totalSent, totalUsed, totalRevisit } = useMemo(
    () => filtered.reduce(
      (acc, c) => ({
        totalRevenue: acc.totalRevenue + c.revenue,
        totalSent: acc.totalSent + c.sent,
        totalUsed: acc.totalUsed + c.used,
        totalRevisit: acc.totalRevisit + c.revisited,
      }),
      { totalRevenue: 0, totalSent: 0, totalUsed: 0, totalRevisit: 0 },
    ),
    [filtered],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">캠페인 성과</h2>
            <p className="mt-1 text-sm text-slate-500">채널별 오픈율·사용률·재방문·매출기여를 분석합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700"
            />
            <button className="flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-600 hover:bg-[#F8FAFF]">
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={
                activeChannel === ch
                  ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1.5 text-sm font-semibold text-primary"
                  : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
              }
            >
              {ch}
            </button>
          ))}
        </div>
      </section>

      {/* Summary KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "총 발송", value: totalSent.toLocaleString(), unit: "건", icon: Users, color: "text-primary" },
          { label: "쿠폰 사용", value: totalUsed.toLocaleString(), unit: "건", icon: ShoppingBag, color: "text-amber-600" },
          { label: "재방문", value: totalRevisit.toLocaleString(), unit: "명", icon: TrendingUp, color: "text-emerald-600" },
          { label: "매출 기여", value: (totalRevenue / 10000).toFixed(0), unit: "만원", icon: DollarSign, color: "text-purple-600" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="rounded-lg bg-[#EEF4FF] p-1.5">
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {kpi.value}
                <span className="ml-1 text-base font-normal text-slate-400">{kpi.unit}</span>
              </p>
            </article>
          );
        })}
      </section>

      {/* Campaign Table */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">캠페인별 성과</h3>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#F7FAFF] text-slate-600">
              <tr>
                <th className="px-4 py-3">캠페인명</th>
                <th className="px-4 py-3">채널</th>
                <th className="px-4 py-3">세그먼트</th>
                <th className="px-4 py-3 text-right">발송</th>
                <th className="px-4 py-3 text-right">오픈율</th>
                <th className="px-4 py-3 text-right">사용율</th>
                <th className="px-4 py-3 text-right">재방문</th>
                <th className="px-4 py-3 text-right">매출 기여</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const openRate = Math.round((c.opened / c.sent) * 100);
                const useRate = Math.round((c.used / c.sent) * 100);
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-[#DCE4F3] bg-white px-2 py-0.5 text-xs text-slate-600">
                        {c.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.segment}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${openRate >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                        {openRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${useRate >= 25 ? "text-emerald-600" : "text-slate-700"}`}>
                        {useRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.revisited}명</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {(c.revenue / 10000).toFixed(0)}만원
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart (Mock) */}
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">캠페인별 매출 기여 비교</p>
          <div className="space-y-3">
            {filtered.map((c) => {
              const pct = Math.round((c.revenue / Math.max(...filtered.map((f) => f.revenue))) * 100);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-slate-600">{c.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-semibold text-slate-700">
                    {(c.revenue / 10000).toFixed(0)}만원
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};