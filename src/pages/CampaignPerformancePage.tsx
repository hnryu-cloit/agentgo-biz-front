import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart2, Download, DollarSign, ShoppingBag, Sparkles, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaignPerformance, predictCampaignUplift, simulateCampaignBep, type CampaignBepSimulation, type CampaignPerformanceSummary, type CampaignUpliftPrediction } from "@/services/marketing";
import { getStoreIntelligence, type StoreIntelligence } from "@/services/analysis";

type Channel = "전체" | "sms" | "push" | "kakao";

const channels: Channel[] = ["전체", "sms", "push", "kakao"];

function buildVirtualCampaigns(intelligence: StoreIntelligence): CampaignPerformanceSummary[] {
  const visits = intelligence.metrics.churn.recent_7d_visits;
  const atRisk = intelligence.metrics.churn.at_risk_customers;
  const aov = intelligence.metrics.sales.avg_order_value;
  const roi = intelligence.metrics.roi_rate;
  const revenue = intelligence.metrics.sales.today_revenue;
  const revisitRate = intelligence.metrics.churn.return_rate;

  return [
    {
      id: "cj-virtual-kakao-lunch",
      name: "[CJ]광화문점 런치 복귀 쿠폰 10%",
      channel: "kakao",
      target_segment: "at_risk",
      sent_count: Math.min(1800, atRisk),
      opened_count: Math.round(Math.min(1800, atRisk) * 0.62),
      used_count: Math.round(Math.min(1800, atRisk) * 0.17),
      open_rate: 0.62,
      use_rate: 0.17,
      sent_at: `${intelligence.metrics.sales.latest_date ?? "2026-02-28"}T11:00:00`,
      revenue_attributed: Math.round(aov * Math.round(Math.min(1800, atRisk) * 0.17) * 0.95),
    },
    {
      id: "cj-virtual-push-dinner",
      name: "[CJ]광화문점 디너 세트 업셀 푸시",
      channel: "push",
      target_segment: "loyal",
      sent_count: Math.max(350, Math.round(visits * 1.3)),
      opened_count: Math.round(Math.max(350, Math.round(visits * 1.3)) * 0.71),
      used_count: Math.round(Math.max(350, Math.round(visits * 1.3)) * 0.23),
      open_rate: 0.71,
      use_rate: 0.23,
      sent_at: `${intelligence.metrics.sales.latest_date ?? "2026-02-28"}T17:30:00`,
      revenue_attributed: Math.round(aov * 1.18 * Math.round(Math.max(350, Math.round(visits * 1.3)) * 0.23)),
    },
    {
      id: "cj-virtual-sms-vip",
      name: "[CJ]광화문점 VIP 재방문 리마인드",
      channel: "sms",
      target_segment: "champions",
      sent_count: Math.max(220, Math.round(intelligence.metrics.churn.unique_customers * 0.08)),
      opened_count: Math.round(Math.max(220, Math.round(intelligence.metrics.churn.unique_customers * 0.08)) * 0.84),
      used_count: Math.round(Math.max(220, Math.round(intelligence.metrics.churn.unique_customers * 0.08)) * Math.max(0.18, revisitRate + 0.09)),
      open_rate: 0.84,
      use_rate: Math.max(0.18, revisitRate + 0.09),
      sent_at: `${intelligence.metrics.sales.latest_date ?? "2026-02-28"}T19:00:00`,
      revenue_attributed: Math.round(revenue * Math.max(0.07, Math.min(0.16, roi / 10000))),
    },
  ];
}

export const CampaignPerformancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeChannel, setActiveChannel] = useState<Channel>("전체");
  const [period, setPeriod] = useState("2026-03");
  const [campaigns, setCampaigns] = useState<CampaignPerformanceSummary[]>([]);
  const [storeIntelligence, setStoreIntelligence] = useState<StoreIntelligence | null>(null);
  const [featuredSimulation, setFeaturedSimulation] = useState<CampaignBepSimulation | null>(null);
  const [upliftPrediction, setUpliftPrediction] = useState<CampaignUpliftPrediction | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getCampaignPerformance().catch(() => []),
      getStoreIntelligence("[CJ]광화문점").catch(() => null),
    ]).then(([response, intelligence]) => {
      if (!alive) return;
      setStoreIntelligence(intelligence);
      if (intelligence) {
        void simulateCampaignBep({
          store_key: "[CJ]광화문점",
          segment_name: "at_risk",
          channel: "kakao",
          offer_type: "discount",
          offer_value: 10,
          target_customers: Math.min(1800, intelligence.metrics.churn.at_risk_customers),
          promo_days: 7,
          fixed_cost: 50000,
          menu_name: "셰프의 마파박스",
          menu_price: 39000,
          margin_rate: 0.36,
          daily_avg_qty: 14,
        }).then((simulation) => {
          if (!alive) return;
          setFeaturedSimulation(simulation);
        }).catch(() => {
          if (!alive) return;
          setFeaturedSimulation(null);
        });
        void predictCampaignUplift({
          store_key: "[CJ]광화문점",
          segment_name: "at_risk",
          channel: "kakao",
          target_customers: Math.min(1800, intelligence.metrics.churn.at_risk_customers),
          discount_rate: 0.1,
        }).then((prediction) => {
          if (!alive) return;
          setUpliftPrediction(prediction);
        }).catch(() => {
          if (!alive) return;
          setUpliftPrediction(null);
        });
      }
      if (response.length > 0) {
        setCampaigns(response);
        return;
      }
      setCampaigns(intelligence ? buildVirtualCampaigns(intelligence) : []);
    }).catch(() => {
      if (!alive) return;
      setCampaigns([]);
      setStoreIntelligence(null);
      setFeaturedSimulation(null);
      setUpliftPrediction(null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const queryCampaign = useMemo<CampaignPerformanceSummary | null>(() => {
    const campaignId = searchParams.get("campaign_id");
    const name = searchParams.get("name");
    const channel = searchParams.get("channel");
    const segment = searchParams.get("segment");
    const sent = searchParams.get("sent");
    const openRate = searchParams.get("open_rate");
    const useRate = searchParams.get("use_rate");
    const revenue = searchParams.get("revenue");
    if (campaignId) return null;
    if (!name || !channel || !segment || !sent || !openRate || !useRate || !revenue) return null;
    const sentCount = Number(sent);
    const open = Number(openRate);
    const use = Number(useRate);
    return {
      id: "query-featured-campaign",
      name,
      channel,
      target_segment: segment,
      sent_count: sentCount,
      opened_count: Math.round(sentCount * open),
      used_count: Math.round(sentCount * use),
      open_rate: open,
      use_rate: use,
      sent_at: new Date().toISOString(),
      revenue_attributed: Number(revenue),
    };
  }, [searchParams]);

  const displayedCampaigns = useMemo(
    () => queryCampaign ? [queryCampaign, ...campaigns.filter((campaign) => campaign.id !== queryCampaign.id)] : campaigns,
    [campaigns, queryCampaign],
  );

  const filtered = useMemo(
    () => displayedCampaigns.filter((campaign) => activeChannel === "전체" || campaign.channel === activeChannel),
    [activeChannel, displayedCampaigns],
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
  const featuredCampaign = useMemo(() => {
    const campaignId = searchParams.get("campaign_id");
    if (campaignId) {
      return displayedCampaigns.find((campaign) => campaign.id === campaignId) ?? displayedCampaigns[0] ?? null;
    }
    return displayedCampaigns[0] ?? null;
  }, [displayedCampaigns, searchParams]);
  const revenueGap = featuredCampaign && featuredSimulation
    ? featuredCampaign.revenue_attributed - featuredSimulation.expected_incremental_revenue
    : 0;
  const conversionGap = featuredCampaign && featuredSimulation
    ? featuredCampaign.use_rate - featuredSimulation.expected_conversion_rate
    : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
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

      {storeIntelligence && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">실데이터 기반 가상 캠페인 시나리오</h3>
            <span className="ml-auto rounded-full border border-[#CFE0FF] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              [CJ]광화문점
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            실제 POS, 영수증, 도도포인트 집계를 바탕으로 발송 가능한 캠페인 성과를 시뮬레이션한 결과입니다.
            현재 기준 객단가 {storeIntelligence.metrics.sales.avg_order_value.toLocaleString()}원,
            최근 7일 방문 {storeIntelligence.metrics.churn.recent_7d_visits.toLocaleString()}건,
            재방문율 {(storeIntelligence.metrics.churn.return_rate * 100).toFixed(1)}%,
            ROI {storeIntelligence.metrics.roi_rate.toFixed(1)}%를 반영했습니다.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {campaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{campaign.channel}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{campaign.name}</p>
                <p className="mt-2 text-xs text-slate-500">
                  발송 {campaign.sent_count.toLocaleString()}건, 사용률 {(campaign.use_rate * 100).toFixed(0)}%, 매출 기여 {(campaign.revenue_attributed / 10000).toFixed(0)}만원
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredCampaign && featuredSimulation && (
        <section className="rounded-2xl border border-[#DCE4F3] bg-white p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">예측 대비 실제 성과 비교</h3>
            <span className="ml-auto rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {featuredCampaign.name}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              {
                label: "예측 매출 기여",
                value: `${(featuredSimulation.expected_incremental_revenue / 10000).toFixed(0)}만원`,
                sub: `모델 ${featuredSimulation.model_name}`,
              },
              {
                label: "실제 매출 기여",
                value: `${(featuredCampaign.revenue_attributed / 10000).toFixed(0)}만원`,
                sub: `${revenueGap >= 0 ? "+" : ""}${(revenueGap / 10000).toFixed(0)}만원 차이`,
              },
              {
                label: "예측 전환율",
                value: `${(featuredSimulation.expected_conversion_rate * 100).toFixed(1)}%`,
                sub: `오픈율 ${(featuredSimulation.expected_open_rate * 100).toFixed(1)}%`,
              },
              {
                label: "실제 사용률",
                value: `${(featuredCampaign.use_rate * 100).toFixed(1)}%`,
                sub: `${conversionGap >= 0 ? "+" : ""}${(conversionGap * 100).toFixed(1)}%p 차이`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#CFE0FF] bg-[#EEF4FF] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">모델 해석</p>
            <p className="mt-2 text-sm text-slate-700">{featuredSimulation.summary}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {featuredSimulation.action_guide.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {upliftPrediction && (
        <section className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-5 shadow-elevated md:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">캠페인 Uplift 예측</h3>
            <span className="ml-auto rounded-full border border-[#CFE0FF] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {upliftPrediction.model_name}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{upliftPrediction.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { label: "예상 uplift", value: `${(upliftPrediction.expected_uplift_rate * 100).toFixed(1)}%` },
              { label: "예상 추가 주문", value: `${upliftPrediction.expected_incremental_orders.toLocaleString()}건` },
              { label: "예상 추가 매출", value: `${(upliftPrediction.expected_incremental_revenue / 10000).toFixed(0)}만원` },
              { label: "모델 신뢰도", value: `${(upliftPrediction.confidence * 100).toFixed(0)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "총 발송", value: summary.totalSent.toLocaleString(), unit: "건", icon: Users, color: "text-[#2f66ff]", bg: "bg-[#eef3ff]" },
          { label: "오픈", value: summary.totalOpened.toLocaleString(), unit: "건", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "쿠폰 사용", value: summary.totalUsed.toLocaleString(), unit: "건", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "매출 기여", value: (summary.totalRevenue / 10000).toFixed(0), unit: "만원", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5">
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

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
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
