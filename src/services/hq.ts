import { get, patch, post, upload } from "../lib/apiClient";
import type {
  AlertResponse,
  AlertUpdateRequest,
  NoticeDistributeRequest,
  NoticeResponse,
} from "../types/api";

// ---------------------------------------------------------------------------
// Control Tower
// ---------------------------------------------------------------------------

export interface ControlTowerOverview {
  period_label: string;
  total_stores: number;
  active_alerts: number;
  action_compliance_rate: number;
  revenue_total: number;
  revenue_vs_last_week: number;
  agents: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
}

export interface AgentStatus {
  id: string;
  agent_name: string;
  display_name: string;
  status: "healthy" | "degraded" | "down";
  latency_ms: number;
  error_rate: number;
  last_heartbeat: string | null;
  error_message?: string | null;
}

export function getControlTowerOverview(): Promise<ControlTowerOverview> {
  return get<ControlTowerOverview>("/hq/control-tower/overview");
}

export function getAgentStatuses(): Promise<AgentStatus[]> {
  return get<AgentStatus[]>("/hq/control-tower/agents");
}

export function refreshAgent(agentName: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/hq/control-tower/agents/${agentName}/refresh`);
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export function getAlerts(params?: {
  severity?: string;
  status?: string;
  store_id?: string;
}): Promise<AlertResponse[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<AlertResponse[]>(`/hq/alerts${qs ? `?${qs}` : ""}`);
}

export function getAlert(alertId: string): Promise<AlertResponse> {
  return get<AlertResponse>(`/hq/alerts/${alertId}`);
}

export function updateAlert(alertId: string, body: AlertUpdateRequest): Promise<AlertResponse> {
  return patch<AlertResponse>(`/hq/alerts/${alertId}`, body);
}

// ---------------------------------------------------------------------------
// Notices (OCR)
// ---------------------------------------------------------------------------

export function getNotices(): Promise<NoticeResponse[]> {
  return get<NoticeResponse[]>("/hq/notices");
}

export function uploadNotice(file: File, title: string): Promise<NoticeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  return upload<NoticeResponse>("/hq/notices/upload", formData);
}

export function getNotice(noticeId: string): Promise<NoticeResponse> {
  return get<NoticeResponse>(`/hq/notices/${noticeId}`);
}

export function distributeNotice(
  noticeId: string,
  body: NoticeDistributeRequest,
): Promise<NoticeResponse> {
  return post<NoticeResponse>(`/hq/notices/${noticeId}/distribute`, body);
}

// ---------------------------------------------------------------------------
// OCR (reprocess)
// ---------------------------------------------------------------------------

export function reprocessOcr(noticeId: string): Promise<NoticeResponse> {
  return post<NoticeResponse>("/ocr/reprocess", { notice_id: noticeId });
}

// ---------------------------------------------------------------------------
// Agents control
// ---------------------------------------------------------------------------

export interface WorkflowRunRequest {
  workflow_name: string;
  store_id?: string;
  params?: Record<string, unknown>;
}

export function runWorkflow(body: WorkflowRunRequest): Promise<Record<string, unknown>> {
  return post<Record<string, unknown>>("/agents/workflows/run", body);
}

export function getAgentSystemStatus(): Promise<Record<string, unknown>> {
  return get<Record<string, unknown>>("/agents/status");
}

export function controlAgent(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return post<Record<string, unknown>>("/agents/control", body);
}
