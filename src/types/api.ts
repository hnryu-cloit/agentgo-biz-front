// =============================================================================
// Shared API types — mirrors agentgo-biz-backend Pydantic schemas
// =============================================================================

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInToken {
  id: string;
  name: string;
  email: string;
  role: "store_owner" | "supervisor" | "hq_admin" | "marketer";
  store_id: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserInToken;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}

// ---------------------------------------------------------------------------
// User & Store
// ---------------------------------------------------------------------------

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: "store_owner" | "supervisor" | "hq_admin" | "marketer";
  store_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  email: string;
  name: string;
  password: string;
  role: "store_owner" | "supervisor" | "hq_admin" | "marketer";
  store_id?: string;
}

export interface StoreResponse {
  id: string;
  name: string;
  region: string;
  address: string;
  size: string | null;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
  seats: number | null;
  service_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreUpdateRequest {
  name?: string;
  region?: string;
  address?: string;
  size?: string;
  open_time?: string;
  close_time?: string;
  break_start?: string;
  break_end?: string;
  seats?: number;
  service_type?: string;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// Pagination wrapper
// ---------------------------------------------------------------------------

export interface ListResponse<T> {
  items: T[];
  total: number;
}

// ---------------------------------------------------------------------------
// Data Upload
// ---------------------------------------------------------------------------

export type DataType = "sales" | "cost" | "customer" | "review";
export type UploadStatus = "pending" | "processing" | "completed" | "failed";

export interface PipelineStages {
  normalize: UploadStatus;
  kpi_aggregate: UploadStatus;
  margin_guard: UploadStatus;
  rfm: UploadStatus;
  anomaly_detect: UploadStatus;
  briefing_schedule: UploadStatus;
}

export interface UploadJobCreateResponse {
  job_id: string;
  status: UploadStatus;
}

export interface UploadJobResponse {
  id: string;
  user_id: string;
  store_id: string;
  data_type: DataType;
  original_filename: string;
  file_path: string;
  file_size_bytes: number;
  status: UploadStatus;
  pipeline_stages: PipelineStages;
  error_detail: string | null;
  quality_score: number | null;
  preview_rows: Record<string, unknown>[] | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadMappingRequest {
  job_id: string;
  store_id: string;
  period_start: string;
  period_end: string;
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export type ActionStatus = "pending" | "executed" | "deferred";
export type ActionPriority = "high" | "medium" | "low";
export type ActionCategory = "pricing" | "staffing" | "inventory" | "marketing" | "operations";

export interface ActionResponse {
  id: string;
  store_id: string;
  created_by: string;
  title: string;
  description: string;
  category: ActionCategory;
  priority: ActionPriority;
  status: ActionStatus;
  defer_reason: string | null;
  ai_basis: string | null;
  expected_impact: string | null;
  due_date: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionUpdateRequest {
  status: ActionStatus;
  defer_reason?: string;
}

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

export type CampaignStatus = "draft" | "sent" | "completed";
export type CampaignChannel = "sms" | "push" | "kakao";
export type OfferType = "discount" | "coupon" | "free_item";

export interface CampaignCreateRequest {
  name: string;
  channel: CampaignChannel;
  target_segment: string;
  offer_type: OfferType;
  offer_value: string;
  message_template: string;
  start_date: string;
  end_date: string;
}

export interface CampaignResponse {
  id: string;
  name: string;
  channel: CampaignChannel;
  target_segment: string;
  offer_type: OfferType;
  offer_value: string;
  message_template: string;
  status: CampaignStatus;
  sent_count: number;
  opened_count: number;
  used_count: number;
  revisit_count: number;
  revenue_attributed: number;
  created_by: string;
  sent_at: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface AlertResponse {
  id: string;
  store_id: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  detected_at: string;
  anomaly_score: number | null;
  status: AlertStatus;
  assigned_to: string | null;
  resolution_comment: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertUpdateRequest {
  status: AlertStatus;
  resolution_comment?: string;
}

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

export type EscalationSeverity = "high" | "medium" | "low";
export type EscalationStatus = "open" | "acknowledged" | "resolved";

export interface EscalationCreateRequest {
  store_id: string;
  title: string;
  description: string;
  severity: EscalationSeverity;
}

export interface EscalationResponse {
  id: string;
  store_id: string;
  reported_by: string;
  title: string;
  description: string;
  severity: EscalationSeverity;
  status: EscalationStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Visit Log
// ---------------------------------------------------------------------------

export interface VisitLogCreateRequest {
  store_id: string;
  visit_date: string;
  purpose: string;
  summary: string;
  issues_found: string | null;
  coaching_points: string | null;
  next_visit_date: string | null;
}

export interface VisitLogResponse {
  id: string;
  store_id: string;
  supervisor_id: string;
  visit_date: string;
  purpose: string;
  summary: string;
  issues_found: string | null;
  coaching_points: string | null;
  next_visit_date: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Notice (OCR)
// ---------------------------------------------------------------------------

export type OcrStatus = "pending" | "processing" | "completed" | "failed";

export interface NoticeResponse {
  id: string;
  title: string;
  file_url: string;
  uploaded_by: string;
  ocr_status: OcrStatus;
  extracted_text: string | null;
  summary: string | null;
  checklist: string[] | null;
  ocr_confidence: number | null;
  distributed_to: string[] | null;
  distributed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoticeDistributeRequest {
  store_ids: string[];
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export type ReportType = "daily" | "weekly";
export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export interface ReportGenerateRequest {
  report_type: ReportType;
  store_id: string;
  period_label: string;
}

export interface ReportResponse {
  id: string;
  report_type: ReportType;
  store_id: string;
  created_by: string;
  title: string;
  status: ReportStatus;
  file_url: string | null;
  period_label: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface ItemMaster {
  id: string;
  name: string;
  unit: string;
  category: string;
  safety_stock: number;
  store_id: string;
}

export interface ItemMasterCreate {
  name: string;
  unit: string;
  category: string;
  safety_stock: number;
  store_id: string;
}

export interface InventoryAuditCreate {
  item_id: string;
  actual_stock: number;
  store_id: string;
}

export interface InventoryAudit {
  id: string;
  item_id: string;
  actual_stock: number;
  store_id: string;
  audit_date: string;
}

export interface InventoryLoss {
  item_id: string;
  name: string;
  loss_rate: number;
  is_excess: boolean;
}

// ---------------------------------------------------------------------------
// Labor
// ---------------------------------------------------------------------------

export type ScheduleStatus = "scheduled" | "actual" | "absent";

export interface EmployeeSchedule {
  id: string;
  employee_name: string;
  role: string;
  start_time: string;
  end_time: string;
  status: ScheduleStatus;
  store_id: string;
}

export interface EmployeeScheduleCreate {
  employee_name: string;
  role: string;
  start_time: string;
  end_time: string;
  status: ScheduleStatus;
  store_id: string;
}

export interface LaborTarget {
  id: string;
  store_id: string;
  sales_per_labor_hour_target: number;
  updated_at: string;
}

export interface LaborTargetCreate {
  store_id: string;
  sales_per_labor_hour_target: number;
}

export interface LaborPerformance {
  store_id: string;
  hour: string;
  sales_per_labor_hour: number;
  recommended_staff: number;
  attainment_rate: number;
}

// ---------------------------------------------------------------------------
// Commands (POS simulation)
// ---------------------------------------------------------------------------

export interface CommandParseResponse {
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  raw_command: string;
}

export interface ValidationResponse {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}