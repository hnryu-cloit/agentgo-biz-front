import { get, post, authStorage } from "../lib/apiClient";
import type { LoginRequest, TokenResponse, AccessTokenResponse, UserInToken, UserResponse } from "../types/api";

const BYPASS_ACCESS_TOKEN = "bypass-access-token";
const BYPASS_REFRESH_TOKEN = "bypass-refresh-token";
const BYPASS_ROLE_KEY = "bypassUserRole";

function buildBypassUser(role?: LoginRequest["role"]): UserInToken {
  return {
    id: "demo-user",
    name: "Demo User",
    email: "demo@agentgo.biz",
    role: role ?? "store_owner",
    store_id: role === "store_owner" ? "demo-store" : null,
  };
}

export async function login(body: LoginRequest): Promise<TokenResponse> {
  const user = buildBypassUser(body.role);
  const res: TokenResponse = {
    access_token: BYPASS_ACCESS_TOKEN,
    refresh_token: BYPASS_REFRESH_TOKEN,
    token_type: "bearer",
    user,
  };
  authStorage.setAccessToken(res.access_token);
  authStorage.setRefreshToken(res.refresh_token);
  localStorage.setItem(BYPASS_ROLE_KEY, user.role);
  return res;
}

export async function logout(): Promise<void> {
  const refreshToken = authStorage.getRefreshToken();
  localStorage.removeItem(BYPASS_ROLE_KEY);
  if (refreshToken === BYPASS_REFRESH_TOKEN) {
    authStorage.clear();
    return;
  }
  try {
    await post<void>("/auth/logout", { refresh_token: refreshToken });
  } finally {
    authStorage.clear();
  }
}

export async function refreshToken(): Promise<AccessTokenResponse> {
  const refreshToken = authStorage.getRefreshToken();
  if (refreshToken === BYPASS_REFRESH_TOKEN) {
    authStorage.setAccessToken(BYPASS_ACCESS_TOKEN);
    return { access_token: BYPASS_ACCESS_TOKEN, token_type: "bearer" };
  }
  const res = await post<AccessTokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  authStorage.setAccessToken(res.access_token);
  return res;
}

export function getMe(): Promise<UserResponse> {
  if (authStorage.getAccessToken() === BYPASS_ACCESS_TOKEN) {
    const role = (localStorage.getItem(BYPASS_ROLE_KEY) as UserInToken["role"] | null) ?? "store_owner";
    return Promise.resolve({
      id: "demo-user",
      email: "demo@agentgo.biz",
      name: "Demo User",
      role,
      store_id: role === "store_owner" ? "demo-store" : null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return get<UserResponse>("/users/me");
}
