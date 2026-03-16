import { get, post, upload } from "../lib/apiClient";
import type {
  DataType,
  ListResponse,
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
  formData.append("data_type", dataType);
  formData.append("store_id", storeId);
  return upload<UploadJobCreateResponse>("/data/upload", formData);
}

export function getUploadJobs(params?: {
  store_id?: string;
  data_type?: DataType;
  status?: string;
}): Promise<ListResponse<UploadJobResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<UploadJobResponse>>(`/data/upload/jobs${qs ? `?${qs}` : ""}`);
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