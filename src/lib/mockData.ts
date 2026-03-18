import type { BenchmarkAction, BenchmarkStoreSummary, RoiMetrics } from "@/services/analysis";
import type { CustomerInsights, OwnerDashboard } from "@/services/owner";
import type { ControlTowerOverview } from "@/services/hq";
import type { StoreRiskSummary, SvDashboard } from "@/services/supervisor";
import type { ResourceSourceCatalog, UploadJobResponse } from "@/types/api";
import type { AlertResponse } from "@/types/api";

export const homeCatalogMock = {
  storeCount: 14,
  menuCount: 46,
  latestDate: "2026-02-28",
};

export const ownerDashboardMock: OwnerDashboard = {
  store_key: "[CJ]광화문점",
  store_name: "[CJ]광화문점",
  latest_date: "2026-02-28",
  today_revenue: 6208900,
  revenue_vs_yesterday: -1941100,
  transaction_count: 46,
  avg_order_value: 134976.09,
  cancel_rate: 0,
  peak_hour: "런치·디너 피크",
  kpi_trend: [
    { label: "02-24", revenue: 10104100 },
    { label: "02-25", revenue: 12534500 },
    { label: "02-26", revenue: 6390500 },
    { label: "02-27", revenue: 8150000 },
    { label: "02-28", revenue: 6208900 },
  ],
};

export const ownerCustomerInsightsMock: CustomerInsights = {
  store_key: "크리스탈제이드",
  period_days: 90,
  latest_date: "2026-02-28",
  total_events: 7673,
  unique_customers: 6280,
  return_rate: 0.1272,
  earn_count: 7402,
  use_count: 234,
  recent_7d_visits: 481,
  visit_trend_delta_pct: 14.25,
  daily_trend: [
    { date: "2026-02-22", visit_count: 102, unique_customers: 101 },
    { date: "2026-02-23", visit_count: 62, unique_customers: 61 },
    { date: "2026-02-24", visit_count: 45, unique_customers: 43 },
    { date: "2026-02-25", visit_count: 65, unique_customers: 64 },
    { date: "2026-02-26", visit_count: 47, unique_customers: 47 },
    { date: "2026-02-27", visit_count: 81, unique_customers: 63 },
    { date: "2026-02-28", visit_count: 79, unique_customers: 70 },
  ],
};

export const supervisorDashboardMock: SvDashboard = {
  total_stores: 13,
  p0_alert_count: 0,
  avg_cancel_rate: 0.0026,
  low_margin_store_count: 3,
};

export const supervisorStoresMock: StoreRiskSummary[] = [
  {
    id: "[CJ]인스파이어점",
    name: "[CJ]인스파이어점",
    region: "[CJ]인스파이어점",
    size: null,
    is_active: true,
    data_source: "pos",
    alert_count: 0,
    risk_score: 86.72,
    sales_total: 10335300,
    sales_delta_pct: 86.72,
    avg_order_value: 120991,
    cancel_rate: 0,
  },
  {
    id: "[CJ]광화문점",
    name: "[CJ]광화문점",
    region: "[CJ]광화문점",
    size: null,
    is_active: true,
    data_source: "pos",
    alert_count: 0,
    risk_score: 23.82,
    sales_total: 6208900,
    sales_delta_pct: -23.82,
    avg_order_value: 128040,
    cancel_rate: 0,
  },
  {
    id: "[CJ]소공점",
    name: "[CJ]소공점",
    region: "[CJ]소공점",
    size: null,
    is_active: true,
    data_source: "pos",
    alert_count: 0,
    risk_score: 14.72,
    sales_total: 11673900,
    sales_delta_pct: -14.72,
    avg_order_value: 158920,
    cancel_rate: 0.7,
  },
];

export const roiMock: RoiMetrics = {
  period_label: "2026-02-22 ~ 2026-02-28",
  promo_cost: 33691940,
  revenue_before: 995377360,
  revenue_during: 1008959375,
  revenue_after: 1008959375,
  incremental_revenue: 13582015,
  roi_rate: 40.31,
  contributing_factors: [
    { factor: "객수 증가", weight: -1.15 },
    { factor: "객단가 변화", weight: -6.24 },
    { factor: "취소율 개선", weight: -0.24 },
  ],
};

export const benchmarkStoresMock: BenchmarkStoreSummary[] = [
  {
    store_id: "[CJ]광화문점",
    store_name: "[CJ]광화문점",
    region: "[CJ]광화문점",
    data_source: "pos",
    similarity_score: 100,
    sales_total: 6208900,
    margin_rate: 86.24,
    review_score: 5,
  },
  {
    store_id: "[CJ]소공점",
    store_name: "[CJ]소공점",
    region: "[CJ]소공점",
    data_source: "pos",
    similarity_score: 100,
    sales_total: 11673900,
    margin_rate: 86.63,
    review_score: 4.86,
  },
  {
    store_id: "[CJ]아이파크용산점",
    store_name: "[CJ]아이파크용산점",
    region: "[CJ]아이파크용산점",
    data_source: "pos",
    similarity_score: 100,
    sales_total: 16396900,
    margin_rate: 88.44,
    review_score: 4.87,
  },
];

export const benchmarkActionsMock: Record<string, BenchmarkAction[]> = {
  "[CJ]광화문점": [
    {
      title: "비피크 시간대 객수 보강",
      description: "유사 매장 평균 대비 매출이 낮습니다. 한산 시간대 세트 제안과 재방문 쿠폰을 우선 적용하세요.",
      expected_impact: "+2,304,142원 매출 여지",
      priority: "high",
    },
  ],
  "[CJ]소공점": [
    {
      title: "취소율 원인 점검",
      description: "환불 비중이 높습니다. 피크 시간대 제조 지연과 품절 메뉴를 먼저 점검하세요.",
      expected_impact: "-0.48%p 취소율 개선 여지",
      priority: "high",
    },
  ],
  "[CJ]아이파크용산점": [
    {
      title: "상위 객단가 유지 메뉴 강화",
      description: "용산점은 객단가 강점이 있습니다. 디너 세트와 프리미엄 메뉴 노출을 유지하세요.",
      expected_impact: "+1.0%p 마진율 방어",
      priority: "low",
    },
  ],
};

export function isOwnerDashboardEmpty(value: OwnerDashboard): boolean {
  return !value.latest_date || value.kpi_trend.length === 0;
}

export function isSupervisorDashboardEmpty(value: SvDashboard): boolean {
  return value.total_stores === 0 && value.p0_alert_count === 0 && value.low_margin_store_count === 0;
}

export function isRoiMetricsEmpty(value: RoiMetrics): boolean {
  return value.period_label === "데이터 없음" || value.contributing_factors.length === 0;
}

export const controlTowerOverviewMock: ControlTowerOverview = {
  period_label: "2026-02-28",
  total_stores: 13,
  active_alerts: 0,
  action_compliance_rate: 0,
  revenue_total: 110148300,
  revenue_vs_last_week: 23456880,
  agents: {
    total: 3,
    healthy: 2,
    degraded: 1,
    down: 0,
  },
};

export const uploadJobsMock: UploadJobResponse[] = [
  {
    id: "cj-job-1",
    user_id: "system",
    original_filename: "크리스탈 제이드_일자별매출_분석__2026-01-16_2026-01-22.xlsx",
    file_path: "/uploads/cj_pos_daily_sales_2026-01-22.xlsx",
    file_size_bytes: 184320,
    data_type: "pos_daily_sales",
    store_id: "[CJ]광화문점",
    status: "completed",
    pipeline_stages: null,
    error_detail: null,
    quality_score: 98,
    preview_rows: null,
    period_start: "2026-01-16",
    period_end: "2026-01-22",
    created_at: "2026-02-28T09:10:00+09:00",
    updated_at: "2026-02-28T09:12:00+09:00",
  },
  {
    id: "cj-job-2",
    user_id: "system",
    original_filename: "크리스탈제이드_메뉴라인업.xlsx",
    file_path: "/uploads/cj_menu_lineup.xlsx",
    file_size_bytes: 98304,
    data_type: "menu_lineup",
    store_id: "크리스탈제이드",
    status: "completed",
    pipeline_stages: null,
    error_detail: null,
    quality_score: 94,
    preview_rows: null,
    period_start: "2026-02-27",
    period_end: "2026-02-28",
    created_at: "2026-02-28T08:40:00+09:00",
    updated_at: "2026-02-28T08:42:00+09:00",
  },
  {
    id: "cj-job-3",
    user_id: "system",
    original_filename: "크리스탈 제이드_영수증리스트_2025-12-01_2026-02-28.xlsx",
    file_path: "/uploads/cj_receipt_listing_2026-02-28.xlsx",
    file_size_bytes: 65536,
    data_type: "receipt_listing",
    store_id: "[CJ]광화문점",
    status: "failed",
    pipeline_stages: null,
    error_detail: { message: "header mismatch" },
    quality_score: 71,
    preview_rows: null,
    period_start: "2025-12-01",
    period_end: "2026-02-28",
    created_at: "2026-02-28T07:55:00+09:00",
    updated_at: "2026-02-28T07:57:00+09:00",
  },
];

export const resourceCatalogMock: ResourceSourceCatalog[] = [
  {
    source_kind: "pos_daily_sales",
    label: "POS 일자별 매출",
    description: "일자별 POS 매출 집계 리소스",
    stores: [
      { store_key: "[CJ]광화문점", latest_file_name: "크리스탈 제이드_일자별매출_분석__2026-01-16_2026-01-22.xlsx", file_count: 1, date_start: "2026-01-16", date_end: "2026-01-22" },
      { store_key: "[CJ]소공점", latest_file_name: "크리스탈 제이드_일자별매출_분석__2026-01-16_2026-01-22.xlsx", file_count: 1, date_start: "2026-01-16", date_end: "2026-01-22" },
    ],
  },
  {
    source_kind: "menu_lineup",
    label: "메뉴 라인업",
    description: "메뉴 라인업 및 원가 리소스",
    stores: [
      { store_key: "크리스탈제이드", latest_file_name: "크리스탈제이드_메뉴라인업.xlsx", file_count: 1, date_start: "2026-02-27", date_end: "2026-02-28" },
      { store_key: "소공점", latest_file_name: "크리스탈제이드_메뉴라인업.xlsx", file_count: 1, date_start: "2026-02-27", date_end: "2026-02-28" },
    ],
  },
  {
    source_kind: "receipt_listing",
    label: "영수증 목록",
    description: "영수증 상세 리소스",
    stores: [
      { store_key: "[CJ]광화문점", latest_file_name: "크리스탈 제이드_영수증리스트_2025-12-01_2026-02-28.xlsx", file_count: 1, date_start: "2025-12-01", date_end: "2026-02-28" },
    ],
  },
  {
    source_kind: "bo_point_usage",
    label: "BO 포인트 사용",
    description: "포인트 사용 내역 리소스",
    stores: [
      { store_key: "[CJ]광화문점", latest_file_name: "크리스탈 제이드_BO포인트사용_2026-02-27_2026-02-28.xlsx", file_count: 1, date_start: "2026-02-27", date_end: "2026-02-28" },
    ],
  },
];

export const resourceDatasetPreviewMock = {
  headers: ["sales_date", "store_name", "total_sales_amount", "receipt_count", "refund_amount"],
  rows: [
    { sales_date: "2026-02-28", store_name: "[CJ]광화문점", total_sales_amount: 6208900, receipt_count: 46, refund_amount: 0 },
    { sales_date: "2026-02-27", store_name: "[CJ]광화문점", total_sales_amount: 8150000, receipt_count: 62, refund_amount: 398000 },
    { sales_date: "2026-02-26", store_name: "[CJ]광화문점", total_sales_amount: 6390500, receipt_count: 48, refund_amount: 148400 },
  ],
};

export const qnaSuggestionsMock = [
  "[CJ]광화문점 어제 매출이 왜 떨어졌어?",
  "크리스탈제이드 재방문율이 어느 정도야?",
  "[CJ]소공점 취소율이 높은 이유가 뭐야?",
  "크리스탈제이드 점심 피크 인원 더 필요해?",
];

export const qnaFallbackResponses: Record<string, { content: string; evidence: { label: string; value: string }[]; confidence: number }> = {
  sales: {
    content: "[CJ]광화문점의 최신 매출은 6,208,900원이며 전일 대비 1,941,100원 감소했습니다.",
    evidence: [
      { label: "기준 일자", value: "2026-02-28" },
      { label: "결제건수", value: "46건" },
      { label: "평균 객단가", value: "134,976원" },
      { label: "권장 해석", value: "금요일 대비 토요일 매출이 꺾였습니다. 디너 시간대 객수 회복 액션이 우선입니다." },
    ],
    confidence: 84,
  },
  cancel: {
    content: "[CJ]광화문점의 최신 취소율은 0.00%입니다.",
    evidence: [
      { label: "기준 일자", value: "2026-02-28" },
      { label: "매출", value: "6,208,900원" },
      { label: "결제건수", value: "46건" },
      { label: "권장 해석", value: "당일 취소는 안정적이지만 전일에는 환불 398,000원이 있어 피크타임 이슈를 같이 봐야 합니다." },
    ],
    confidence: 79,
  },
  margin: {
    content: "[CJ]광화문점의 추정 마진율은 86.24% 수준으로 확인됩니다.",
    evidence: [
      { label: "기준 매장", value: "[CJ]광화문점" },
      { label: "비교 매장", value: "[CJ]아이파크용산점" },
      { label: "추정 마진율", value: "86.24%" },
      { label: "권장 해석", value: "동일 브랜드 상위점 대비 매출 격차가 커서 객수 회복 액션이 우선입니다." },
    ],
    confidence: 76,
  },
};

export const alertsMock: AlertResponse[] = [
  {
    id: "cj-alert-1",
    store_id: "[CJ]광화문점",
    alert_type: "sales_drop",
    title: "광화문점 매출 하락 감지",
    description: "최신 매출이 전일 대비 1,941,100원 감소했습니다.",
    severity: "warning",
    detected_at: "2026-02-28T21:30:00+09:00",
    anomaly_score: 0.72,
    status: "open",
    assigned_to: null,
    resolution_comment: null,
    resolved_at: null,
    created_at: "2026-02-28T21:35:00+09:00",
    updated_at: "2026-02-28T21:35:00+09:00",
  },
  {
    id: "cj-alert-2",
    store_id: "[CJ]소공점",
    alert_type: "data_sync_delay",
    title: "영수증 업로드 재시도 필요",
    description: "크리스탈 제이드 영수증 리소스 업로드가 header mismatch로 실패했습니다.",
    severity: "warning",
    detected_at: "2026-02-28T07:55:00+09:00",
    anomaly_score: 0.61,
    status: "acknowledged",
    assigned_to: "hq_admin",
    resolution_comment: null,
    resolved_at: null,
    created_at: "2026-02-28T08:00:00+09:00",
    updated_at: "2026-02-28T08:30:00+09:00",
  },
];
