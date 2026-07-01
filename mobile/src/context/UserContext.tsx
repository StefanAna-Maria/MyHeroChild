import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import { AvatarType } from "@/constants/avatars";

export type UserAvatarOption = {
  avatar: AvatarType;
  minLevel: number;
  unlocked: boolean;
  claimed: boolean;
  selectable: boolean;
};

type User = {
  username: string;
  email?: string;
  role: "ADMIN" | "PARENT" | "CHILD";
  level: number;
  xp: number;
  currentLevelMinTotalXp: number;
  nextLevelMinTotalXp?: number | null;
  rewardPoints: number;
  avatar: AvatarType;
  avatarOptions: UserAvatarOption[];
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {

  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async () => {

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.get("/users/me");

      // IMPORTANT: ApiResponse -> data.data
      setUser(res.data.data);

    } catch (error) {

      console.log("Failed to fetch user", error);
      setUser(null);

    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
