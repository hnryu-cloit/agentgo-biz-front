import { get, post, authStorage } from "../lib/apiClient";
import type { LoginRequest, TokenResponse, AccessTokenResponse, UserResponse } from "../types/api";

export async function login(body: LoginRequest): Promise<TokenResponse> {
  const res = await post<TokenResponse>("/auth/login", body);
  authStorage.setAccessToken(res.access_token);
  authStorage.setRefreshToken(res.refresh_token);
  return res;
}

export async function logout(): Promise<void> {
  const refreshToken = authStorage.getRefreshToken();
  try {
    await post<void>("/auth/logout", { refresh_token: refreshToken });
  } finally {
    authStorage.clear();
  }
}

export async function refreshToken(): Promise<AccessTokenResponse> {
  const refreshToken = authStorage.getRefreshToken();
  const res = await post<AccessTokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  authStorage.setAccessToken(res.access_token);
  return res;
}

export function getMe(): Promise<UserResponse> {
  return get<UserResponse>("/users/me");
}