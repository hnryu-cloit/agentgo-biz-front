import { get, post } from "../lib/apiClient";
import type {
  CampaignCreateRequest,
  CampaignResponse,
} from "../types/api";

// ---------------------------------------------------------------------------
// RFM Segments
// ---------------------------------------------------------------------------

export interface RfmSegment {
  segment: "champions" | "loyal" | "at_risk" | "lost";
  count: number;
  avg_order_value: number;
  avg_visit_frequency: number;
  revenue_share: number;
}

export interface ChurnRiskCustomer {
  customer_id: string;
  name: string;
  last_visit_date: string;
  churn_probability: number;
  segment: string;
  recommended_offer: string;
}

export function getRfmSegments(): Promise<RfmSegment[]> {
  return get<RfmSegment[]>("/marketing/rfm/segments");
}

export function getChurnRisks(): Promise<ChurnRiskCustomer[]> {
  return get<ChurnRiskCustomer[]>("/marketing/rfm/churn-risks");
}

export function excludeChurnRisk(customerId: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/marketing/rfm/churn-risks/${customerId}/exclude`);
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export function getCampaigns(params?: {
  status?: string;
  channel?: string;
}): Promise<CampaignResponse[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<CampaignResponse[]>(`/marketing/campaigns${qs ? `?${qs}` : ""}`);
}

export function createCampaign(body: CampaignCreateRequest): Promise<CampaignResponse> {
  return post<CampaignResponse>("/marketing/campaigns", body);
}

export function sendCampaign(campaignId: string): Promise<CampaignResponse> {
  return post<CampaignResponse>(`/marketing/campaigns/${campaignId}/send`);
}

// ---------------------------------------------------------------------------
// Campaign Performance
// ---------------------------------------------------------------------------

export interface CampaignPerformanceSummary {
  id: string;
  name: string;
  channel: string;
  target_segment: string;
  sent_count: number;
  opened_count: number;
  used_count: number;
  open_rate: number;
  use_rate: number;
  sent_at: string | null;
  revenue_attributed: number;
}

export interface CampaignBepSimulation {
  store_id: string;
  model_name: string;
  summary: string;
  expected_open_rate: number;
  expected_conversion_rate: number;
  expected_incremental_orders: number;
  expected_incremental_revenue: number;
  expected_incremental_profit: number;
  break_even_orders: number;
  break_even_revenue: number;
  break_even_probability: number;
  expected_roi: number;
  confidence: number;
  action_guide: string[];
  evidence: Array<{
    metric: string;
    value: string;
    period: string;
    source: { name: string; uploaded_at: string };
  }>;
}

export interface CampaignUpliftPrediction {
  store_id: string;
  model_name: string;
  summary: string;
  expected_incremental_orders: number;
  expected_incremental_revenue: number;
  expected_uplift_rate: number;
  expected_redemption_rate: number;
  confidence: number;
  action_guide: string[];
  evidence: Array<{
    metric: string;
    value: string;
    period: string;
    source: { name: string; uploaded_at: string };
  }>;
}

export function getCampaignPerformance(params?: {
  channel?: string;
  period?: string;
}): Promise<CampaignPerformanceSummary[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<CampaignPerformanceSummary[]>(`/marketing/performance${qs ? `?${qs}` : ""}`);
}

export function simulateCampaignBep(params: {
  store_key: string;
  segment_name: string;
  channel: "sms" | "push" | "kakao";
  offer_type: "discount" | "coupon" | "free_item";
  offer_value: number;
  target_customers: number;
  promo_days: number;
  fixed_cost: number;
  menu_name: string;
  menu_price: number;
  margin_rate: number;
  daily_avg_qty: number;
}): Promise<CampaignBepSimulation> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  return get<CampaignBepSimulation>(`/marketing/campaigns/simulate-bep?${qs}`);
}

export function predictCampaignUplift(params: {
  store_key: string;
  segment_name: string;
  channel: "sms" | "push" | "kakao";
  target_customers: number;
  discount_rate: number;
}): Promise<CampaignUpliftPrediction> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  return get<CampaignUpliftPrediction>(`/marketing/campaigns/predict-uplift?${qs}`);
}
