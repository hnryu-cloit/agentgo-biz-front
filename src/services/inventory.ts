import { get, post } from "../lib/apiClient";
import type {
  InventoryAudit,
  InventoryAuditCreate,
  InventoryLoss,
  ItemMaster,
  ItemMasterCreate,
} from "../types/api";

// ---------------------------------------------------------------------------
// 메뉴 원가 (MenuLineupSnapshot 기반)
// ---------------------------------------------------------------------------

export interface MenuCostItem {
  id: string;
  menu_name: string;
  menu_category: string | null;
  sales_price: number | null;
  cost_amount: number | null;
  cost_rate: number | null;
}

export interface MenuCostsResponse {
  store_key: string;
  item_count: number;
  items: MenuCostItem[];
}

export function getMenuCosts(storeKey: string, category?: string): Promise<MenuCostsResponse> {
  const params = new URLSearchParams({ store_key: storeKey });
  if (category) params.set("category", category);
  return get<MenuCostsResponse>(`/inventory/menu-costs?${params}`);
}

export function getInventoryItems(params?: {
  store_id?: string;
  category?: string;
}): Promise<ItemMaster[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ItemMaster[]>(`/inventory/items${qs ? `?${qs}` : ""}`);
}

export function createInventoryItem(body: ItemMasterCreate): Promise<ItemMaster> {
  return post<ItemMaster>("/inventory/items", body);
}

export function submitInventoryAudit(body: InventoryAuditCreate): Promise<InventoryAudit> {
  return post<InventoryAudit>("/inventory/audit", body);
}

export function getTheoreticalInventory(params?: {
  store_id?: string;
}): Promise<Array<Record<string, unknown>>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<Array<Record<string, unknown>>>(`/inventory/theoretical${qs ? `?${qs}` : ""}`);
}

export function getInventorySummary(params?: {
  store_id?: string;
}): Promise<InventoryLoss[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<InventoryLoss[]>(`/inventory/summary${qs ? `?${qs}` : ""}`);
}
