import type { NavigationArea } from "../config/navigation/navigation.types";

export interface RouteMeta {
  title: string;
  description: string;
  areaId: NavigationArea;
  itemId: string;
}

export interface AppRouteHandle {
  meta?: RouteMeta;
}