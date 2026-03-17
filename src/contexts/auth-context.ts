import { createContext } from "react";
import type { UserInToken } from "@/types/api";

export interface AuthContextValue {
  user: UserInToken | null;
  isLoading: boolean;
  setUser: (user: UserInToken | null) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
