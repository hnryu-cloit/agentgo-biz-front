import { get, patch, post } from "../lib/apiClient";
import type { ActionResponse, ActionUpdateRequest, ListResponse } from "../types/api";

// ---------------------------------------------------------------------------
// Dashboard KPIs & summary
// ---------------------------------------------------------------------------

export interface OwnerDashboard {
  store_id: string;
  period_label: string;
  sales_total: number;
  sales_vs_last_week: number;
  margin_rate: number;
  margin_guard_triggered: boolean;
  review_sentiment_score: number;
  top_alerts: string[];
}

export function getOwnerDashboard(): Promise<OwnerDashboard> {
  return get<OwnerDashboard>("/owner/dashboard");
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function getOwnerActions(params?: {
  status?: string;
  category?: string;
}): Promise<ListResponse<ActionResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<ActionResponse>>(`/owner/actions${qs ? `?${qs}` : ""}`);
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
  suggestions: string[];
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