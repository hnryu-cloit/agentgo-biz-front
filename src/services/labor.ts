import { get, post } from "../lib/apiClient";
import type {
  EmployeeSchedule,
  EmployeeScheduleCreate,
  LaborPerformance,
  LaborTarget,
  LaborTargetCreate,
  ListResponse,
} from "../types/api";

export function getLaborSchedule(params?: {
  store_id?: string;
  date?: string;
}): Promise<ListResponse<EmployeeSchedule>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<EmployeeSchedule>>(`/labor/schedule${qs ? `?${qs}` : ""}`);
}

export function createScheduleEntry(body: EmployeeScheduleCreate): Promise<EmployeeSchedule> {
  return post<EmployeeSchedule>("/labor/schedule", body);
}

export function getLaborProductivity(params?: {
  store_id?: string;
  date?: string;
}): Promise<ListResponse<LaborPerformance>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<LaborPerformance>>(`/labor/productivity${qs ? `?${qs}` : ""}`);
}

export function setLaborTarget(body: LaborTargetCreate): Promise<LaborTarget> {
  return post<LaborTarget>("/labor/target", body);
}

export function getAvailableLabor(params?: {
  store_id?: string;
  date?: string;
}): Promise<ListResponse<EmployeeSchedule>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<EmployeeSchedule>>(`/labor/available-labor${qs ? `?${qs}` : ""}`);
}