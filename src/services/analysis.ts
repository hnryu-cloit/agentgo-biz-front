import { get } from "../lib/apiClient";

// ---------------------------------------------------------------------------
// Promo ROI
// ---------------------------------------------------------------------------

export interface RoiMetrics {
  period_label: string;
  promo_cost: number;
  revenue_before: number;
  revenue_during: number;
  revenue_after: number;
  incremental_revenue: number;
  roi_rate: number;
  contributing_factors: { factor: string; weight: number }[];
}

export function getRoiAnalysis(params?: {
  store_id?: string;
  campaign_id?: string;
}): Promise<RoiMetrics> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<RoiMetrics>(`/analysis/roi${qs ? `?${qs}` : ""}`);
}

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------

export interface BenchmarkStoreSummary {
  store_id: string;
  store_name: string;
  region: string;
  data_source: "pos" | "dodo_point";
  similarity_score: number;
  // POS 기반
  sales_total: number | null;
  margin_rate: number | null;
  review_score: number | null;
  // 도도포인트 기반
  dodo_total_events?: number;
  dodo_unique_customers?: number;
}

export interface BenchmarkGap {
  metric: string;
  gap: number;
  unit: string;
}

export interface BenchmarkAction {
  title: string;
  description: string;
  expected_impact: string;
  priority: "high" | "medium" | "low";
}

export interface BenchmarkActionResponse {
  store_id: string;
  store_name: string;
  benchmark_gaps: BenchmarkGap[];
  recommended_actions: BenchmarkAction[];
}

export interface InsightEvidence {
  metric: string;
  value: string;
  period: string;
  source: {
    name: string;
    uploaded_at: string;
  };
}

export interface AiAnalysisSection {
  store_id: string;
  analysis_type: string;
  summary: string;
  highlights: string[];
  evidence: InsightEvidence[];
  warnings: Array<{ code: string; message: string }>;
  cold_start_mode: boolean;
}

export interface AiStaffingSection {
  store_id: string;
  status: string;
  gap: number;
  opportunity_cost: number;
  recommendation: string;
  evidence: InsightEvidence[];
}

export interface StoreIntelligence {
  store_id: string;
  summary: string;
  priority_actions: string[];
  sales: AiAnalysisSection | null;
  churn: AiAnalysisSection | null;
  staffing: AiStaffingSection[];
  metrics: {
    sales: {
      latest_date: string | null;
      today_revenue: number;
      previous_revenue: number;
      avg_order_value: number;
      guest_count: number;
      receipt_count: number;
      cancel_rate: number;
    };
    churn: {
      recent_7d_visits: number;
      return_rate: number;
      unique_customers: number;
      at_risk_customers: number;
    };
    roi_rate: number;
  };
}

export function getBenchmarkStores(params?: {
  store_id?: string;
  region?: string;
}): Promise<BenchmarkStoreSummary[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<BenchmarkStoreSummary[]>(`/analysis/benchmark/stores${qs ? `?${qs}` : ""}`);
}

export function getBenchmarkActions(storeId: string): Promise<BenchmarkActionResponse> {
  return get<BenchmarkActionResponse>(`/analysis/benchmark/stores/${storeId}/actions`);
}

export function getStoreIntelligence(storeKey?: string): Promise<StoreIntelligence> {
  const qs = storeKey ? `?store_key=${encodeURIComponent(storeKey)}` : "";
  return get<StoreIntelligence>(`/analysis/store-intelligence${qs}`);
}
