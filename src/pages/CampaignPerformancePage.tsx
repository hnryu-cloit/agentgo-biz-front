import type React from "react";
import { useMemo, useState } from "react";
import { BarChart2, Download, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">마케팅</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">캠페인 성과</h2>
            <p className="mt-1 text-base text-muted-foreground">채널별 오픈율·사용률·재방문·매출기여를 분석합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            />
            <button className="flex items-center gap-1.5 rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm font-bold text-[#4a5568] hover:bg-[#f4f7ff] shadow-sm transition-colors">
              <Download className="h-3.5 w-3.5" />
              데이터 내보내기
            </button>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-bold transition-all shadow-sm",
                activeChannel === ch
                  ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                  : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]"
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      </section>

      {/* Summary KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "총 발송", value: totalSent.toLocaleString(), unit: "건", icon: Users, color: "text-[#2f66ff]", bg: "bg-[#eef3ff]" },
          { label: "쿠폰 사용", value: totalUsed.toLocaleString(), unit: "건", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "재방문", value: totalRevisit.toLocaleString(), unit: "명", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "매출 기여", value: (totalRevenue / 10000).toFixed(0), unit: "만원", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="app-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-muted-foreground">{kpi.label}</p>
                <div className={cn("rounded-lg p-1.5 shadow-sm", kpi.bg)}>
                  <Icon className={cn("h-4 w-4", kpi.color)} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <p className="text-3xl font-bold text-foreground leading-none">{kpi.value}</p>
                <span className="text-xs font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">{kpi.unit}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Campaign Table */}
      <section className="app-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="rounded-lg bg-[var(--muted)] p-1.5 shadow-sm">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">캠페인별 상세 성과</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#f4f7ff] text-[#4a5568]">
              <tr>
                <th className="px-4 py-3 font-bold">캠페인명</th>
                <th className="px-4 py-3 font-bold text-center">채널</th>
                <th className="px-4 py-3 font-bold text-center">세그먼트</th>
                <th className="px-4 py-3 text-right font-bold">발송</th>
                <th className="px-4 py-3 text-right font-bold">오픈율</th>
                <th className="px-4 py-3 text-right font-bold">사용율</th>
                <th className="px-4 py-3 text-right font-bold">재방문</th>
                <th className="px-4 py-3 text-right font-bold">매출 기여</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const openRate = Math.round((c.opened / c.sent) * 100);
                const useRate = Math.round((c.used / c.sent) * 100);
                return (
                  <tr key={c.id} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50">
                    <td className="px-4 py-3 font-bold text-[#1a2138]">{c.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-2 py-0.5 text-[11px] font-bold text-[#2f66ff] shadow-sm">
                        {c.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-medium">{c.segment}</td>
                    <td className="px-4 py-3 text-right text-[#34415b] font-mono font-medium">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-black shadow-sm",
                        openRate >= 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {openRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "font-bold text-sm",
                        useRate >= 25 ? "text-emerald-600 underline underline-offset-4 decoration-emerald-200" : "text-[#34415b]"
                      )}>
                        {useRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#34415b] font-medium">{c.revisited}명</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {(c.revenue / 10000).toFixed(0)}만원
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart (Visual Summary) */}
        <div className="mt-8 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.15em]">Campaign Revenue Comparison</p>
          <div className="space-y-4">
            {filtered.map((c) => {
              const pct = Math.round((c.revenue / Math.max(...filtered.map((f) => f.revenue))) * 100);
              return (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 truncate text-xs font-bold text-[#4a5568]">{c.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                      <div
                        className="h-full rounded-full bg-primary shadow-sm transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-24 shrink-0 text-right text-sm font-bold text-foreground font-mono">
                    {(c.revenue / 10000).toFixed(0)}<span className="text-[10px] text-[var(--subtle-foreground)] ml-0.5">만원</span>
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