export const ROUTE_PATHS = {
  root: "/",
  login: "/login",

  platform: {
    root: "/platform",
    dashboard: "/platform/dashboard",

    tenants: {
      directory: "/platform/tenants",
      create: "/platform/tenants/create",
      details: (tenantId: number | string) =>
        `/platform/tenants/${tenantId}`,
    },

    users: "/platform/users",
    access: "/platform/access",
    configuration: "/platform/configuration",
    administration: "/platform/administration",
  },
} as const;