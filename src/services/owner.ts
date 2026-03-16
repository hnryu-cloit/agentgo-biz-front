import { get, patch, post } from "../lib/apiClient";
import type { ActionResponse, ActionUpdateRequest } from "../types/api";

// ---------------------------------------------------------------------------
// Dashboard KPIs & summary
// ---------------------------------------------------------------------------

export interface OwnerDashboard {
  store_key?: string | null;
  store_name: string;
  latest_date: string | null;
  today_revenue: number;
  revenue_vs_yesterday: number;
  transaction_count: number;
  avg_order_value: number;
  cancel_rate: number;
  peak_hour: string | null;
  kpi_trend: Array<{ label: string; revenue: number }>;
}

export function getOwnerDashboard(storeKey?: string): Promise<OwnerDashboard> {
  const qs = storeKey ? `?store_key=${encodeURIComponent(storeKey)}` : "";
  return get<OwnerDashboard>(`/owner/dashboard${qs}`);
}

// ---------------------------------------------------------------------------
// Customer Insights (도도포인트 기반)
// ---------------------------------------------------------------------------

export interface DailyTrendPoint {
  date: string;
  visit_count: number;
  unique_customers: number;
}

export interface CustomerInsights {
  store_key: string;
  period_days: number;
  latest_date: string | null;
  total_events: number;
  unique_customers: number;
  return_rate: number;
  earn_count: number;
  use_count: number;
  recent_7d_visits: number;
  visit_trend_delta_pct: number;
  daily_trend: DailyTrendPoint[];
}

export function getCustomerInsights(storeKey?: string, days = 90): Promise<CustomerInsights> {
  const params = new URLSearchParams({ days: String(days) });
  if (storeKey) params.set("store_key", storeKey);
  return get<CustomerInsights>(`/owner/customer-insights?${params}`);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function getOwnerActions(params?: {
  status?: string;
  category?: string;
}): Promise<ActionResponse[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ActionResponse[]>(`/owner/actions${qs ? `?${qs}` : ""}`);
}

export function updateActionStatus(
  actionId: string,
  body: ActionUpdateRequest,
): Promise<ActionResponse> {
  return patch<ActionResponse>(`/owner/actions/${actionId}`, body);
}

// ---------------------------------------------------------------------------
// Q&A suggestions
// ---------------------------------------------------------------------------

export interface QnaSuggestResponse {
  questions: string[];
}

export function getQnaSuggestions(): Promise<QnaSuggestResponse> {
  return get<QnaSuggestResponse>("/owner/qna/suggest");
}

// ---------------------------------------------------------------------------
// POS commands
// ---------------------------------------------------------------------------

export interface CommandParseRequest {
  command: string;
}

export interface CommandParseResponse {
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  raw_command: string;
}

export interface CommandValidateRequest {
  intent: string;
  entities: Record<string, unknown>;
}

export interface ValidationResponse {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SimulationResult {
  margin_impact: number;
  sales_impact: number;
  recommendation: string;
  details: Record<string, unknown>;
}

export function parseCommand(body: CommandParseRequest): Promise<CommandParseResponse> {
  return post<CommandParseResponse>("/commands/parse", body);
}

export function validateCommand(body: CommandValidateRequest): Promise<ValidationResponse> {
  return post<ValidationResponse>("/commands/validate", body);
}

export function simulateCommand(body: Record<string, unknown>): Promise<SimulationResult> {
  return post<SimulationResult>("/commands/simulate", body);
}
