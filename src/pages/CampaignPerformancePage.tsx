import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, Download, DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaignPerformance, type CampaignPerformanceSummary } from "@/services/marketing";

type Channel = "전체" | "sms" | "push" | "kakao";

const channels: Channel[] = ["전체", "sms", "push", "kakao"];

export const CampaignPerformancePage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<Channel>("전체");
  const [period, setPeriod] = useState("2026-03");
  const [campaigns, setCampaigns] = useState<CampaignPerformanceSummary[]>([]);

  useEffect(() => {
    let alive = true;
    getCampaignPerformance()
      .then((response) => {
        if (!alive) return;
        setCampaigns(response);
      })
      .catch(() => {
        if (!alive) return;
        setCampaigns([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => campaigns.filter((campaign) => activeChannel === "전체" || campaign.channel === activeChannel),
    [activeChannel, campaigns],
  );

  const summary = useMemo(
    () => filtered.reduce(
      (acc, campaign) => ({
        totalRevenue: acc.totalRevenue + campaign.revenue_attributed,
        totalSent: acc.totalSent + campaign.sent_count,
        totalUsed: acc.totalUsed + campaign.used_count,
        totalOpened: acc.totalOpened + campaign.opened_count,
      }),
      { totalRevenue: 0, totalSent: 0, totalUsed: 0, totalOpened: 0 },
    ),
    [filtered],
  );

  const maxRevenue = Math.max(...filtered.map((campaign) => campaign.revenue_attributed), 1);

  return (
    <div className="space-y-6">
      <section className="app-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">마케팅</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">캠페인 성과</h2>
            <p className="mt-1 text-base text-muted-foreground">실제 발송 캠페인의 오픈율·사용률·매출 기여를 확인합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="h-9 rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
            />
            <button className="flex items-center gap-1.5 rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-sm font-bold text-[#4a5568] shadow-sm transition-colors hover:bg-[#f4f7ff]">
              <Download className="h-3.5 w-3.5" />
              데이터 내보내기
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {channels.map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-bold shadow-sm transition-all",
                activeChannel === channel
                  ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                  : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]",
              )}
            >
              {channel}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "총 발송", value: summary.totalSent.toLocaleString(), unit: "건", icon: Users, color: "text-[#2f66ff]", bg: "bg-[#eef3ff]" },
          { label: "오픈", value: summary.totalOpened.toLocaleString(), unit: "건", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "쿠폰 사용", value: summary.totalUsed.toLocaleString(), unit: "건", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "매출 기여", value: (summary.totalRevenue / 10000).toFixed(0), unit: "만원", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
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
                <p className="text-3xl font-bold leading-none text-foreground">{kpi.value}</p>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--subtle-foreground)]">{kpi.unit}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="app-card p-5 md:p-6">
        <div className="mb-5 flex items-center gap-2">
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
                <th className="px-4 py-3 text-center font-bold">채널</th>
                <th className="px-4 py-3 text-center font-bold">세그먼트</th>
                <th className="px-4 py-3 text-right font-bold">발송</th>
                <th className="px-4 py-3 text-right font-bold">오픈율</th>
                <th className="px-4 py-3 text-right font-bold">사용율</th>
                <th className="px-4 py-3 text-right font-bold">오픈</th>
                <th className="px-4 py-3 text-right font-bold">매출 기여</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign) => (
                <tr key={campaign.id} className="border-t border-border transition-colors hover:bg-[var(--panel-soft)]/50">
                  <td className="px-4 py-3 font-bold text-[#1a2138]">{campaign.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-2 py-0.5 text-[11px] font-bold text-[#2f66ff] shadow-sm">
                      {campaign.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-muted-foreground">{campaign.target_segment}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-[#34415b]">{campaign.sent_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("rounded px-1.5 py-0.5 text-xs font-black shadow-sm", campaign.open_rate >= 0.7 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                      {(campaign.open_rate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-sm font-bold", campaign.use_rate >= 0.25 ? "text-emerald-600 underline decoration-emerald-200 underline-offset-4" : "text-[#34415b]")}>
                      {(campaign.use_rate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#34415b]">{campaign.opened_count.toLocaleString()}건</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {(campaign.revenue_attributed / 10000).toFixed(0)}만원
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                    표시할 캠페인 성과 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">Campaign Revenue Comparison</p>
          <div className="space-y-4">
            {filtered.map((campaign) => {
              const pct = Math.round((campaign.revenue_attributed / maxRevenue) * 100);
              return (
                <div key={campaign.id} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 truncate text-xs font-bold text-[#4a5568]">{campaign.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)] shadow-inner">
                      <div className="h-full rounded-full bg-primary shadow-sm transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-24 shrink-0 text-right font-mono text-sm font-bold text-foreground">
                    {(campaign.revenue_attributed / 10000).toFixed(0)}
                    <span className="ml-0.5 text-[10px] text-[var(--subtle-foreground)]">만원</span>
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
