import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import { AvatarType } from "@/constants/avatars";

type User = {
  username: string;
  role: "ADMIN" | "PARENT" | "CHILD";
  level: number;
  xp: number;
  rewardPoints: number;
    avatar: AvatarType;
};

type UserContextType = {
  user: User | null;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {

  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {

    if (!token) {
      setUser(null);
      return;
    }

    try {

      const res = await api.get("/users/me");

      // IMPORTANT: ApiResponse -> data.data
      setUser(res.data.data);

    } catch (error) {

      console.log("Failed to fetch user", error);
      setUser(null);

    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, refreshUser: fetchUser }}>
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