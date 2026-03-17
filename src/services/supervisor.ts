import { get, post } from "../lib/apiClient";
import type {
  EscalationCreateRequest,
  EscalationResponse,
  VisitLogCreateRequest,
  VisitLogResponse,
} from "../types/api";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface SvDashboard {
  total_stores: number;
  p0_alert_count: number;
  avg_cancel_rate: number;
  low_margin_store_count: number;
}

export interface StoreRiskSummary {
  id: string;
  name: string;
  region: string;
  size: string | null;
  is_active: boolean;
  data_source: "pos" | "dodo_point";
  alert_count: number;
  risk_score: number;
  // POS 기반 (data_source === "pos")
  sales_total: number | null;
  sales_delta_pct: number | null;
  avg_order_value: number | null;
  cancel_rate: number | null;
  // 도도포인트 기반 (data_source === "dodo_point")
  dodo_total_events?: number;
  dodo_unique_customers?: number;
  dodo_latest_date?: string | null;
}

export interface StoreKpiCustomerInsights {
  unique_customers_30d: number;
  return_rate: number;
  recent_7d_visits: number;
  visit_trend_delta_pct: number;
  earn_count: number;
}

export interface StoreKpi {
  store_id: string;
  store_name: string;
  revenue_today: number;
  revenue_yesterday: number;
  cancel_rate_today: number;
  cancel_rate_avg: number;
  avg_order_value_today: number;
  avg_order_value_avg: number;
  receipt_count: number;
  payment_total: number;
  sales_date: string | null;
  customer_insights: StoreKpiCustomerInsights;
}

export function getSvDashboard(): Promise<SvDashboard> {
  return get<SvDashboard>("/supervisor/dashboard");
}

export function getSvStores(): Promise<StoreRiskSummary[]> {
  return get<StoreRiskSummary[]>("/supervisor/stores");
}

export function getStoreKpi(storeId: string): Promise<StoreKpi> {
  return get<StoreKpi>(`/supervisor/stores/${storeId}/kpi`);
}

// ---------------------------------------------------------------------------
// Actions & Escalation
// ---------------------------------------------------------------------------

export function getSvActions(params?: {
  store_id?: string;
  status?: string;
}): Promise<Array<{ store_id: string; store_name: string; total_actions: number; executed: number; deferred: number; execution_rate: number }>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<Array<{ store_id: string; store_name: string; total_actions: number; executed: number; deferred: number; execution_rate: number }>>(`/supervisor/actions${qs ? `?${qs}` : ""}`);
}

export function escalateAction(
  actionId: string,
  body: EscalationCreateRequest,
): Promise<EscalationResponse> {
  return post<EscalationResponse>(`/supervisor/actions/${actionId}/escalate`, body);
}

// ---------------------------------------------------------------------------
// Visit Logs
// ---------------------------------------------------------------------------

export function getVisitLogs(params?: {
  store_id?: string;
}): Promise<VisitLogResponse[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<VisitLogResponse[]>(`/supervisor/visit-logs${qs ? `?${qs}` : ""}`);
}

export function createVisitLog(body: VisitLogCreateRequest): Promise<VisitLogResponse> {
  return post<VisitLogResponse>("/supervisor/visit-logs", body);
}

export function getVisitLog(logId: string): Promise<VisitLogResponse> {
  return get<VisitLogResponse>(`/supervisor/visit-logs/${logId}`);
}
