import { adminTheme } from "./adminTheme";
import { childTheme } from "./childTheme";
import { parentTheme } from "./parentTheme";
import { AppRole, AppTheme } from "./theme.types";

export function getThemeByRole(role?: string | null): AppTheme {
  switch (role) {
    case "ADMIN":
      return adminTheme;
    case "CHILD":
      return childTheme;
    case "PARENT":
    default:
      return parentTheme;
  }
}

export type { AppRole, AppTheme };