import { get, patch, post } from "../lib/apiClient";
import type {
  ListResponse,
  StoreResponse,
  StoreUpdateRequest,
  UserCreateRequest,
  UserResponse,
} from "../types/api";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUsers(): Promise<ListResponse<UserResponse>> {
  return get<ListResponse<UserResponse>>("/users");
}

export function createUser(body: UserCreateRequest): Promise<UserResponse> {
  return post<UserResponse>("/users", body);
}

export function setUserActive(userId: string, isActive: boolean): Promise<UserResponse> {
  return patch<UserResponse>(`/users/${userId}/active`, { is_active: isActive });
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export function getStores(): Promise<ListResponse<StoreResponse>> {
  return get<ListResponse<StoreResponse>>("/stores");
}

export function getStore(storeId: string): Promise<StoreResponse> {
  return get<StoreResponse>(`/stores/${storeId}`);
}

export function updateStore(storeId: string, body: StoreUpdateRequest): Promise<StoreResponse> {
  return patch<StoreResponse>(`/stores/${storeId}`, body);
}