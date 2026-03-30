import React, { useCallback, useEffect, useState } from "react";
import { authStorage } from "@/lib/apiClient";
import { getMe } from "@/services/auth";
import type { UserInToken } from "@/types/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInToken | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(authStorage.getAccessToken()));

  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getMe()
      .then((me) => {
        setUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          store_id: me.store_id,
        });
      })
      .catch(() => {
        authStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signOut = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
