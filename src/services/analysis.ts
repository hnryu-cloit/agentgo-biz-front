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
  similarity_score: number;
  sales_total: number;
  margin_rate: number;
  review_score: number;
}

export interface BenchmarkAction {
  title: string;
  description: string;
  expected_impact: string;
  priority: "high" | "medium" | "low";
}

export function getBenchmarkStores(params?: {
  store_id?: string;
  region?: string;
}): Promise<{ items: BenchmarkStoreSummary[]; total: number }> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get(`/analysis/benchmark/stores${qs ? `?${qs}` : ""}`);
}

export function getBenchmarkActions(storeId: string): Promise<{ items: BenchmarkAction[]; total: number }> {
  return get(`/analysis/benchmark/stores/${storeId}/actions`);
}
