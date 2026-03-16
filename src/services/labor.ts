import { get, post } from "../lib/apiClient";
import type {
  EmployeeSchedule,
  EmployeeScheduleCreate,
  LaborPerformance,
  LaborTarget,
  LaborTargetCreate,
} from "../types/api";

// ---------------------------------------------------------------------------
// 시간대별 방문 패턴 (도도포인트 기반)
// ---------------------------------------------------------------------------

export interface HourlyPatternSlot {
  hour: number;
  label: string;
  visit_count: number;
  unique_customers: number;
  recommended_staff: number;
  is_peak: boolean;
}

export interface HourlyPatternResponse {
  store_key: string;
  data_source: string;
  total_earn_events: number;
  avg_hourly_visits: number;
  peak_hours: number[];
  hourly_pattern: HourlyPatternSlot[];
  note?: string;
}

export function getHourlyPattern(storeKey: string): Promise<HourlyPatternResponse> {
  return get<HourlyPatternResponse>(`/labor/hourly-pattern?store_key=${encodeURIComponent(storeKey)}`);
}

export function getLaborSchedule(params?: {
  store_id?: string;
  date?: string;
}): Promise<EmployeeSchedule[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<EmployeeSchedule[]>(`/labor/schedule${qs ? `?${qs}` : ""}`);
}

export function createScheduleEntry(body: EmployeeScheduleCreate): Promise<EmployeeSchedule> {
  return post<EmployeeSchedule>("/labor/schedule", body);
}

export function getLaborProductivity(params?: {
  store_id?: string;
  date?: string;
}): Promise<LaborPerformance[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<LaborPerformance[]>(`/labor/productivity${qs ? `?${qs}` : ""}`);
}

export function setLaborTarget(body: LaborTargetCreate): Promise<LaborTarget> {
  return post<LaborTarget>("/labor/target", body);
}

export function getAvailableLabor(params?: {
  store_id?: string;
  date?: string;
}): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<Record<string, unknown>>(`/labor/available-labor${qs ? `?${qs}` : ""}`);
}
