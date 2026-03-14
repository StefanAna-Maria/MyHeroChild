export type AppRole = "ADMIN" | "PARENT" | "CHILD";

export type AppTheme = {
  role: AppRole;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primaryLight: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    tabBar: string;
    tabIconDefault: string;
    tabIconActive: string;
  };
};