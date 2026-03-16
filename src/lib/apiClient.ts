const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const API_PREFIX = "/api/v1";

// ---------------------------------------------------------------------------
// Auth token storage
// ---------------------------------------------------------------------------

export const authStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
  clear: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const token = authStorage.getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    authStorage.clear();
    window.location.href = "/login";
    throw new ApiError("Unauthorized", 401);
  }

  const contentType = res.headers.get("content-type") || "";
  let data: unknown;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as Record<string, unknown>).detail)
        : res.statusText;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// HTTP method helpers
// ---------------------------------------------------------------------------

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}

export async function upload<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
): Promise<T> {
  return apiRequest<T>(path, { method, body: formData });
}

export async function download(path: string): Promise<Blob> {
  const headers = new Headers();
  const token = authStorage.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, { headers });

  if (res.status === 401) {
    authStorage.clear();
    window.location.href = "/login";
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    throw new ApiError(res.statusText, res.status);
  }

  return res.blob();
}

// ---------------------------------------------------------------------------
// Utility: resolve relative URL from backend (e.g. /uploads/file.pdf)
// ---------------------------------------------------------------------------

export function resolveUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}