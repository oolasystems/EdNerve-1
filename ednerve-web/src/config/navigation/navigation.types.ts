
import type { LucideIcon } from "lucide-react";

export type AccountType = "platform" | "institution";

export type NavigationArea =
  | "overview"
  | "institutions"
  | "users"
  | "access"
  | "configuration"
  | "administration";

export interface NavigationAction {
  label: string;
  targetItemId: string;
  icon?: LucideIcon;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  description: string;
  accountTypes: AccountType[];
  permissions?: string[];
  action?: NavigationAction;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface NavigationAreaConfig {
  id: NavigationArea;
  label: string;
  icon: LucideIcon;
  route: string;
  accountTypes: AccountType[];
  permissions?: string[];
  defaultItemId: string;
  sections: NavigationSection[];
}
