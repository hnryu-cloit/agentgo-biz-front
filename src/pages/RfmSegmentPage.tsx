import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingDown,
  Crown,
  AlertCircle,
  Send,
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles,
  TrendingUp,
  History,
  Download,
  Clock3,
  BellRing,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  excludeChurnRisk,
  getChurnRisks,
  getRfmSegments,
  predictCampaignUplift,
  type ChurnRiskCustomer,
  type CampaignUpliftPrediction,
} from "@/services/marketing";

type SegmentKey = "vip" | "loyal" | "at_risk" | "churned";
type SegmentView = "rfm" | "visit_pattern" | "response" | "revisit";

const segmentMeta: Record<SegmentKey, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string; desc: string }> = {
  vip: {
    label: "VIP 고객",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
    desc: "최근 30일 내 고빈도·고단가 방문 핵심 고객군",
  },
  loyal: {
    label: "우수 고객",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-[#eef3ff]",
    borderColor: "border-[#d5deec]",
    desc: "꾸준한 방문 패턴을 보이며 브랜드 충성도가 높은 지지층",
  },
  at_risk: {
    label: "이탈 우려",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    desc: "최근 45일 이상 미방문, 경쟁사 이탈 징후 포착",
  },
  churned: {
    label: "이탈 고객",
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    desc: "60일 이상 장기 미방문, 강력한 재활성화 오퍼 필요",
  },
};

const viewLabels: Record<SegmentView, string> = {
  rfm: "RFM",
  visit_pattern: "방문 패턴",
  response: "반응 예측",
  revisit: "재방문 예측",
};

type DisplaySegment = {
  key: SegmentKey;
  count: number;
  revenueShare: number;
  avgFrequency: number;
};

type PatternSegment = {
  id: string;
  title: string;
  audience: string;
  description: string;
  expectedAction: string;
  peak: string;
};

type ResponseSegment = {
  id: string;
  title: string;
  channel: "kakao" | "push" | "sms";
  expectedOpen: string;
  expectedUse: string;
  summary: string;
};

type RevisitSegment = {
  id: string;
  title: string;
  expectedReturn: string;
  expectedWindow: string;
  strategy: string;
};

const visitPatternSegments: PatternSegment[] = [
  {
    id: "lunch-core",
    title: "런치 집중형",
    audience: "1,280명",
    description: "12~14시 방문 집중, 점심 세트 반응이 높음",
    expectedAction: "점심 전 푸시/카카오 쿠폰",
    peak: "12:00~14:00",
  },
  {
    id: "dinner-family",
    title: "디너 코스형",
    audience: "940명",
    description: "18~20시 코스/박스 메뉴 반응이 높음",
    expectedAction: "디너 세트 업셀",
    peak: "18:00~20:00",
  },
  {
    id: "weekend-premium",
    title: "주말 프리미엄형",
    audience: "520명",
    description: "주말 방문 빈도가 높고 객단가가 큼",
    expectedAction: "포인트 적립형 리워드",
    peak: "토·일",
  },
];

const responseSegments: ResponseSegment[] = [
  {
    id: "kakao-at-risk",
    title: "카카오 반응형 이탈우려군",
    channel: "kakao",
    expectedOpen: "60.5%",
    expectedUse: "14.5%",
    summary: "크리스탈제이드 재방문 쿠폰에 가장 빠르게 반응하는 그룹",
  },
  {
    id: "push-loyal",
    title: "푸시 반응형 우수고객군",
    channel: "push",
    expectedOpen: "71.0%",
    expectedUse: "23.0%",
    summary: "세트 메뉴 업셀과 멤버십 안내 반응이 높음",
  },
  {
    id: "sms-vip",
    title: "SMS 반응형 VIP",
    channel: "sms",
    expectedOpen: "84.0%",
    expectedUse: "21.0%",
    summary: "고단가 VIP는 짧은 혜택 알림에 반응이 좋음",
  },
];

const revisitSegments: RevisitSegment[] = [
  {
    id: "return-7d",
    title: "7일 내 복귀 가능 높음",
    expectedReturn: "32%",
    expectedWindow: "1~7일",
    strategy: "포인트 리마인드 + 점심 쿠폰",
  },
  {
    id: "return-30d",
    title: "30일 내 복귀 가능 중간",
    expectedReturn: "18%",
    expectedWindow: "8~30일",
    strategy: "디너 세트 할인",
  },
  {
    id: "return-low",
    title: "복귀 저확률",
    expectedReturn: "7%",
    expectedWindow: "30일+",
    strategy: "강한 오퍼 또는 재활성화 캠페인",
  },
];

export const RfmSegmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<SegmentView>("rfm");
  const [segments, setSegments] = useState<DisplaySegment[]>([
    { key: "vip", count: 612, revenueShare: 34, avgFrequency: 3.8 },
    { key: "loyal", count: 1984, revenueShare: 41, avgFrequency: 2.4 },
    { key: "at_risk", count: 1147, revenueShare: 17, avgFrequency: 1.1 },
    { key: "churned", count: 2537, revenueShare: 8, avgFrequency: 0.4 },
  ]);
  const [selected, setSelected] = useState<SegmentKey>("at_risk");
  const [customers, setCustomers] = useState<(ChurnRiskCustomer & { excluded: boolean })[]>([
    {
      customer_id: "cj-c1",
      name: "CJ-CRM-10291",
      last_visit_date: "2026-01-21",
      churn_probability: 0.82,
      segment: "at_risk",
      recommended_offer: "[CJ]광화문점 점심 재방문 쿠폰",
      excluded: false,
    },
    {
      customer_id: "cj-c2",
      name: "CJ-CRM-18842",
      last_visit_date: "2026-01-15",
      churn_probability: 0.76,
      segment: "at_risk",
      recommended_offer: "크리스탈제이드 디너 세트 10% 쿠폰",
      excluded: false,
    },
    {
      customer_id: "cj-c3",
      name: "CJ-CRM-22410",
      last_visit_date: "2025-12-28",
      churn_probability: 0.91,
      segment: "churned",
      recommended_offer: "도도포인트 2배 적립 리워드",
      excluded: false,
    },
  ]);
  const [sentOffer, setSentOffer] = useState(false);
  const [upliftPrediction, setUpliftPrediction] = useState<CampaignUpliftPrediction | null>(null);

  useEffect(() => {
    let alive = true;

    const segmentMap: Record<string, SegmentKey> = {
      champions: "vip",
      loyal: "loyal",
      at_risk: "at_risk",
      lost: "churned",
    };

    Promise.all([getRfmSegments(), getChurnRisks()])
      .then(([segData, churnData]) => {
        if (!alive) return;

        const mappedSegs = segData.map((s) => ({
          key: segmentMap[s.segment] || "loyal",
          count: s.count,
          revenueShare: Math.round(s.revenue_share * 100),
          avgFrequency: s.avg_visit_frequency || (s.segment === "champions" ? 3.8 : s.segment === "loyal" ? 2.4 : s.segment === "at_risk" ? 1.1 : 0.4),
        }));

        setSegments(mappedSegs);
        setCustomers(churnData.map((c) => ({ ...c, excluded: false })));
      })
      .catch(() => undefined);

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const activeSegment = segments.find((segment) => segment.key === selected);
    if (!activeSegment) return () => { alive = false; };
    predictCampaignUplift({
      store_key: "[CJ]광화문점",
      segment_name: selected === "vip" ? "champions" : selected === "churned" ? "at_risk" : selected,
      channel: selected === "vip" ? "sms" : selected === "loyal" ? "push" : "kakao",
      target_customers: activeSegment.count,
      discount_rate: selected === "vip" ? 0.07 : selected === "loyal" ? 0.08 : 0.1,
    }).then((response) => {
      if (!alive) return;
      setUpliftPrediction(response);
    }).catch(() => {
      if (!alive) return;
      setUpliftPrediction(null);
    });
    return () => { alive = false; };
  }, [segments, selected]);

  const activeSegment = useMemo(
    () => segments.find((segment) => segment.key === selected) || null,
    [segments, selected],
  );

  const targetCount = customers.filter((customer) => !customer.excluded).length;

  const toggleExclude = (id: string) => {
    setCustomers((prev) => prev.map((customer) => (
      customer.customer_id === id ? { ...customer, excluded: !customer.excluded } : customer
    )));
    excludeChurnRisk(id).catch(() => undefined);
  };

  const handleOpenCampaignDesigner = () => {
    const channel = selected === "vip" ? "sms" : selected === "loyal" ? "push" : "kakao";
    const discount = selected === "vip" ? "7" : selected === "loyal" ? "8" : "10";
    const menu =
      selected === "vip"
        ? "cj-m4"
        : selected === "loyal"
          ? "cj-m5"
          : selected === "at_risk"
            ? "cj-m1"
            : "cj-m2";
    navigate(
      `/marketing/campaigns?segment=${selected === "vip" ? "champions" : selected === "churned" ? "lost" : selected}&channel=${channel}&discount=${discount}&menu=${menu}`,
    );
  };

  const overviewCards = [
    { label: "전체 고객", value: `${segments.reduce((acc, segment) => acc + segment.count, 0).toLocaleString()}명`, icon: Users },
    { label: "최근 7일 방문", value: "481건", icon: Clock3 },
    { label: "이탈 우려 고객", value: `${segments.find((segment) => segment.key === "at_risk")?.count.toLocaleString() ?? 0}명`, icon: AlertCircle },
    { label: "평균 재방문율", value: "12.7%", icon: RefreshCw },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Customer Segment Studio</p>
              <h1 className="text-xl font-bold text-foreground">크리스탈 제이드 고객 세그먼트 솔루션</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">RFM, 방문 패턴, 반응 예측, 재방문 가능성을 한 화면에서 운영 액션으로 연결합니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
              <History className="h-4 w-4" />
              세그먼트 비교
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5BE9] shadow-sm">
              <Download className="h-4 w-4" />
              데이터 내보내기
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(viewLabels) as SegmentView[]).map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-bold shadow-sm transition-all",
                view === item
                  ? "border-[#c9d8ff] bg-[#eef3ff] text-[#2f66ff]"
                  : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]",
              )}
            >
              {viewLabels[item]}
            </button>
          ))}
        </div>
      </section>

      {view === "rfm" && (
        <div className="grid gap-4 md:grid-cols-4">
          {(Object.keys(segmentMeta) as SegmentKey[]).map((key) => {
            const meta = segmentMeta[key];
            const data = segments.find((segment) => segment.key === key);
            const isActive = selected === key;
            const Icon = meta.icon;

            return (
              <article
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "cursor-pointer rounded-2xl border transition-all duration-300 p-5 relative overflow-hidden",
                  isActive
                    ? "border-primary bg-white shadow-elevated ring-1 ring-primary/10 scale-[1.02]"
                    : "border-border/90 bg-card hover:border-primary/30 hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-xl p-2.5", isActive ? "bg-primary text-white" : "bg-[#f4f7ff] text-primary")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isActive && <div className="live-point" />}
                </div>
                <div className="mt-4 space-y-1">
                  <p className={cn("text-[11px] font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>{meta.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-foreground">{(data?.count ?? 0).toLocaleString()}</p>
                    <span className="text-xs text-muted-foreground font-medium">명</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">매출 기여도</span>
                    <span className="text-foreground">{data?.revenueShare ?? 0}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[#e8edf5]">
                    <div className={cn("h-full transition-all duration-1000", isActive ? "bg-primary" : "bg-primary/30")} style={{ width: `${data?.revenueShare ?? 0}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {view === "visit_pattern" && (
        <section className="grid gap-4 md:grid-cols-3">
          {visitPatternSegments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{item.audience}</p>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p>피크 시간: {item.peak}</p>
                <p>추천 액션: {item.expectedAction}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      {view === "response" && (
        <section className="grid gap-4 md:grid-cols-3">
          {responseSegments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.title}</p>
                <span className="rounded-full border border-[#CFE0FF] bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-primary">{item.channel}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                  <p className="text-[10px] text-slate-400 uppercase">예상 오픈</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{item.expectedOpen}</p>
                </div>
                <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                  <p className="text-[10px] text-slate-400 uppercase">예상 사용</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{item.expectedUse}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{item.summary}</p>
            </article>
          ))}
        </section>
      )}

      {view === "revisit" && (
        <section className="grid gap-4 md:grid-cols-3">
          {revisitSegments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/90 bg-card p-5 shadow-elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{item.expectedReturn}</p>
              <p className="mt-1 text-sm text-slate-500">예상 복귀 윈도우 {item.expectedWindow}</p>
              <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                <p className="text-[10px] uppercase text-slate-400">추천 전략</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{item.strategy}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl border border-[#c9d8ff] bg-[#eef3ff] p-6 relative overflow-hidden">
            <div className="flex items-start gap-5 relative z-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#d5deec]">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {segmentMeta[selected].label} 집중 최적화 가이드
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">AI Insight</span>
                </h3>
                <p className="mt-2 text-sm font-medium text-[#4a5568] leading-relaxed italic">
                  "{segmentMeta[selected].desc}. 크리스탈제이드 실데이터 기준으로 현재 세그먼트는 재방문 유도와 채널 선택이 핵심입니다. 점심/디너 방문 패턴과 채널 반응 차이를 함께 보는 편이 맞습니다."
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "방문 빈도", val: `${activeSegment?.avgFrequency.toFixed(1) ?? 0}회/월`, icon: TrendingUp },
                    { label: "예상 uplift", val: upliftPrediction ? `${(upliftPrediction.expected_uplift_rate * 100).toFixed(1)}%` : "14.5%", icon: Target },
                    { label: "예상 추가 매출", val: upliftPrediction ? `₩${Math.round(upliftPrediction.expected_incremental_revenue).toLocaleString()}` : "₩20.1M", icon: BarChart3 },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/60 bg-white/40 p-3 shadow-sm">
                      <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-foreground">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
          </section>

          <article className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#f4f7ff] p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">세그먼트 타겟 리스트</h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {targetCount}명 활성화됨
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4">고객 식별자</th>
                    <th className="px-4 py-4 text-center">현재 등급</th>
                    <th className="px-4 py-4 text-center">최종 방문</th>
                    <th className="px-4 py-4">이탈 위험도</th>
                    <th className="px-6 py-4 text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {customers.map((customer) => (
                    <tr key={customer.customer_id} className={cn("transition-colors hover:bg-[#f4f7ff]/50", customer.excluded && "opacity-40 grayscale-[0.5]")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#eef3ff] to-[#d5deec] flex items-center justify-center text-[10px] font-bold text-primary">
                            {customer.name?.slice(0, 1) || "C"}
                          </div>
                          <span className="font-mono text-xs font-bold text-foreground">#{customer.name || customer.customer_id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                          customer.segment === "lost" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-primary border-blue-100",
                        )}>
                          {customer.segment?.toUpperCase() || "GRADE"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-xs font-medium text-muted-foreground">
                        {customer.last_visit_date ? new Date(customer.last_visit_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8edf5]">
                            <div
                              className={cn("h-full transition-all duration-1000", customer.churn_probability > 0.7 ? "bg-red-500" : "bg-amber-500")}
                              style={{ width: `${Math.round(customer.churn_probability * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black w-6 tabular-nums">{Math.round(customer.churn_probability * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleExclude(customer.customer_id)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm",
                            customer.excluded
                              ? "bg-muted text-muted-foreground border-transparent"
                              : "bg-white text-red-600 border-red-100 hover:bg-red-50",
                          )}
                        >
                          {customer.excluded ? "포함하기" : "제외하기"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <article className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-5">
              <div className="rounded-lg bg-[#eef3ff] p-2">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">세그먼트 액션 패널</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#d5deec] bg-[#f4f7ff]">
                <p className="text-[10px] font-bold text-primary uppercase mb-2">선택 세그먼트</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground uppercase">{segmentMeta[selected].label}</span>
                  <span className="text-sm font-bold text-primary">{targetCount}명</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#d5deec] bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">추천 채널/오퍼</p>
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {selected === "vip" ? "SMS + VIP 리마인드" : selected === "loyal" ? "Push + 디너 세트 업셀" : "Kakao + 복귀 쿠폰"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[#d5deec] bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">예상 Uplift</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {upliftPrediction ? `${(upliftPrediction.expected_uplift_rate * 100).toFixed(1)}%` : "14.5%"}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-[#d5deec] bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">예상 추가 주문</p>
                  <p className="text-lg font-bold text-primary">
                    {upliftPrediction ? `${upliftPrediction.expected_incremental_orders}건` : "167건"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {sentOffer ? (
                <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  세그먼트 캠페인 실행 완료
                </div>
              ) : (
                <button
                  onClick={handleOpenCampaignDesigner}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-sm shadow-sm transition-all hover:bg-[#1E5BE9]"
                >
                  <Send className="h-4 w-4" />
                  캠페인 설계로 이동
                </button>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-emerald-50 p-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-foreground">세그먼트별 매출 점유율</h4>
            </div>
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.key} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">{segmentMeta[segment.key].label}</span>
                    <span className="text-foreground">{segment.revenueShare}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#e8edf5] rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", segmentMeta[segment.key].color.replace("text", "bg"))} style={{ width: `${segment.revenueShare}%` }} />
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
