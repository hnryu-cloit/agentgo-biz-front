import { get, post } from "../lib/apiClient";
import type {
  CampaignCreateRequest,
  CampaignResponse,
  ListResponse,
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

export function getRfmSegments(): Promise<ListResponse<RfmSegment>> {
  return get<ListResponse<RfmSegment>>("/marketing/rfm/segments");
}

export function getChurnRisks(): Promise<ListResponse<ChurnRiskCustomer>> {
  return get<ListResponse<ChurnRiskCustomer>>("/marketing/rfm/churn-risks");
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
}): Promise<ListResponse<CampaignResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<CampaignResponse>>(`/marketing/campaigns${qs ? `?${qs}` : ""}`);
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
  channel: string;
  sent: number;
  open_rate: number;
  use_rate: number;
  revisit_rate: number;
  revenue_attributed: number;
}

export function getCampaignPerformance(): Promise<ListResponse<CampaignPerformanceSummary>> {
  return get<ListResponse<CampaignPerformanceSummary>>("/marketing/performance");
}