import { get, post } from "../lib/apiClient";
import type {
  InventoryAudit,
  InventoryAuditCreate,
  InventoryLoss,
  ItemMaster,
  ItemMasterCreate,
  ListResponse,
} from "../types/api";

export function getInventoryItems(params?: {
  store_id?: string;
  category?: string;
}): Promise<ListResponse<ItemMaster>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<ItemMaster>>(`/inventory/items${qs ? `?${qs}` : ""}`);
}

export function createInventoryItem(body: ItemMasterCreate): Promise<ItemMaster> {
  return post<ItemMaster>("/inventory/items", body);
}

export function submitInventoryAudit(body: InventoryAuditCreate): Promise<InventoryAudit> {
  return post<InventoryAudit>("/inventory/audit", body);
}

export function getTheoreticalInventory(params?: {
  store_id?: string;
}): Promise<ListResponse<Record<string, unknown>>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<Record<string, unknown>>>(`/inventory/theoretical${qs ? `?${qs}` : ""}`);
}

export function getInventorySummary(params?: {
  store_id?: string;
}): Promise<ListResponse<InventoryLoss>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<InventoryLoss>>(`/inventory/summary${qs ? `?${qs}` : ""}`);
}