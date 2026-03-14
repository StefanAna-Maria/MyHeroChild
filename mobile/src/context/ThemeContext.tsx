import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { getRoleFromToken } from "../auth/jwt";
import { getThemeByRole } from "../theme/getThemeByRole";
import { AppTheme } from "../theme/theme.types";

type ThemeContextType = {
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  let role = null;

  if (token) {
    role = getRoleFromToken(token);
  }

  const theme = getThemeByRole(role);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context.theme;
}