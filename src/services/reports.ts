import { get, post, download, resolveUrl } from "../lib/apiClient";
import type { ListResponse, ReportGenerateRequest, ReportResponse } from "../types/api";

export function getReports(params?: {
  report_type?: string;
  store_id?: string;
}): Promise<ListResponse<ReportResponse>> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return get<ListResponse<ReportResponse>>(`/reports${qs ? `?${qs}` : ""}`);
}

export function generateReport(body: ReportGenerateRequest): Promise<ReportResponse> {
  return post<ReportResponse>("/reports/generate", body);
}

export async function downloadReport(
  report: Pick<ReportResponse, "file_url" | "title">,
): Promise<void> {
  if (!report.file_url) return;

  // file_url may be a relative path like /uploads/... or a full URL
  const fullUrl = resolveUrl(report.file_url);
  if (!fullUrl) return;

  const blob = await download(report.file_url.replace(/^https?:\/\/[^/]+/, ""));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
