import { get, post } from "../lib/apiClient";
import type {
  ActionResponse,
  EscalationCreateRequest,
  EscalationResponse,
  ListResponse,
  VisitLogCreateRequest,
  VisitLogResponse,
} from "../types/api";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface SvDashboard {
  period_label: string;
  risk_store_count: number;
  action_completion_rate: number;
  avg_margin_rate: number;
  total_alerts: number;
}

export interface StoreRiskSummary {
  store_id: string;
  store_name: string;
  region: string;
  risk_level: "high" | "medium" | "low";
  margin_rate: number;
  alert_count: number;
  last_visit_date: string | null;
}

export function getSvDashboard(): Promise<SvDashboard> {
  return get<SvDashboard>("/supervisor/dashboard");
}

export function getSvStores(): Promise<ListResponse<StoreRiskSummary>> {
  return get<ListResponse<StoreRiskSummary>>("/supervisor/stores");
}

export function getStoreKpi(storeId: string): Promise<Record<string, unknown>> {
  return get<Record<string, unknown>>(`/supervisor/stores/${storeId}/kpi`);
}

// ---------------------------------------------------------------------------
// Actions & Escalation
// ---------------------------------------------------------------------------

export function getSvActions(params?: {
  store_id?: string;
  status?: string;
}): Promise<ListResponse<ActionResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<ActionResponse>>(`/supervisor/actions${qs ? `?${qs}` : ""}`);
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
}): Promise<ListResponse<VisitLogResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<VisitLogResponse>>(`/supervisor/visit-logs${qs ? `?${qs}` : ""}`);
}

export function createVisitLog(body: VisitLogCreateRequest): Promise<VisitLogResponse> {
  return post<VisitLogResponse>("/supervisor/visit-logs", body);
}

export function getVisitLog(logId: string): Promise<VisitLogResponse> {
  return get<VisitLogResponse>(`/supervisor/visit-logs/${logId}`);
}