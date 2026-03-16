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

export function getCampaignPerformance(params?: {
  channel?: string;
  period?: string;
}): Promise<CampaignPerformanceSummary[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<CampaignPerformanceSummary[]>(`/marketing/performance${qs ? `?${qs}` : ""}`);
}
