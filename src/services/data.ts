import { get, post, upload } from "../lib/apiClient";
import type {
  DataType,
  ResourceCatalogResponse,
  ResourceDatasetResponse,
  UploadJobCreateResponse,
  UploadJobResponse,
  UploadMappingRequest,
} from "../types/api";

export function uploadDataFile(
  file: File,
  dataType: DataType,
  storeId: string,
): Promise<UploadJobCreateResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return upload<UploadJobCreateResponse>(`/data/upload?data_type=${encodeURIComponent(dataType)}&store_id=${encodeURIComponent(storeId)}`, formData);
}

export function getUploadJobs(params?: {
  store_id?: string;
  data_type?: DataType;
  status?: string;
}): Promise<UploadJobResponse[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<UploadJobResponse[]>(`/data/upload/jobs${qs ? `?${qs}` : ""}`);
}

export function getUploadJob(jobId: string): Promise<UploadJobResponse> {
  return get<UploadJobResponse>(`/data/upload/jobs/${jobId}`);
}

export function retryUploadJob(jobId: string): Promise<UploadJobResponse> {
  return post<UploadJobResponse>(`/data/upload/jobs/${jobId}/retry`);
}

export function confirmDataMapping(body: UploadMappingRequest): Promise<UploadJobResponse> {
  return post<UploadJobResponse>("/data/mapping", body);
}

export function getResourceCatalog(): Promise<ResourceCatalogResponse> {
  return get<ResourceCatalogResponse>("/data/resource/catalog");
}

export function getResourceDataset(
  sourceKind: "pos_daily_sales" | "bo_point_usage" | "receipt_listing" | "menu_lineup",
  storeKey: string,
  limit = 10,
): Promise<ResourceDatasetResponse> {
  return get<ResourceDatasetResponse>(
    `/data/resource/datasets/${encodeURIComponent(sourceKind)}/${encodeURIComponent(storeKey)}?limit=${limit}`,
  );
}

export function importResourceDataset(
  sourceKind: string,
  storeKey?: string,
): Promise<{ imported_count: number; message: string }> {
  const qs = new URLSearchParams({ source_kind: sourceKind });
  if (storeKey) qs.append("store_key", storeKey);
  return post<{ imported_count: number; message: string }>(`/data/resource/import?${qs.toString()}`, {});
}
