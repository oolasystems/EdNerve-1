
import {
  LayoutDashboard,
  University,
  Building2,
  PlusCircle,
  Users,
  UserCog,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  Settings,
  ClipboardList,
  Activity,
  Plus,
} from "lucide-react";

import type { NavigationAreaConfig } from "./navigation.types";

export const platformAdminNavigation: NavigationAreaConfig[] = [
  // =====================================================
  // 1. OVERVIEW
  // =====================================================
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    route: "/platform/dashboard",
    accountTypes: ["platform"],
    defaultItemId: "dashboard",

    sections: [
      {
        id: "overview",
        title: "DASHBOARD",

        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            route: "/platform/dashboard",
            description: "Overview of the OolaEdNerve platform.",
            accountTypes: ["platform"],
            permissions: ["platform.dashboard.view"],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 2. INSTITUTION MANAGEMENT
  // =====================================================
  {
    id: "institutions",
    label: "Institution Management",
    icon: University,
    route: "/platform/tenants",
    accountTypes: ["platform"],
    defaultItemId: "tenant-directory",

    sections: [
      {
        id: "tenants",
        title: "TENANTS",

        items: [
          {
            id: "tenant-directory",
            label: "Tenant Directory",
            icon: Building2,
            route: "/platform/tenants",
            description:
              "Manage universities and colleges registered on OolaEdNerve.",
            accountTypes: ["platform"],
            permissions: ["platform.tenants.view"],

            action: {
              label: "Add Institution",
              targetItemId: "add-tenant",
              icon: Plus,
            },
          },

          {
            id: "add-tenant",
            label: "Add New Tenant",
            icon: PlusCircle,
            route: "/platform/tenants/create",
            description:
              "Register a new university or college on OolaEdNerve.",
            accountTypes: ["platform"],
            permissions: ["platform.tenants.create"],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 3. USER MANAGEMENT
  // =====================================================
  {
    id: "users",
    label: "User Management",
    icon: Users,
    route: "/platform/users",
    accountTypes: ["platform"],
    defaultItemId: "all-users",

    sections: [
      {
        id: "users",
        title: "USER MANAGEMENT",

        items: [
          {
            id: "all-users",
            label: "All Users",
            icon: Users,
            route: "/platform/users",
            description: "View and manage users across the platform.",
            accountTypes: ["platform"],
            permissions: ["platform.users.view"],
          },

          {
            id: "platform-users",
            label: "Platform Users",
            icon: UserCog,
            route: "/platform/users/platform",
            description: "Manage Platform Admin accounts and access.",
            accountTypes: ["platform"],
            permissions: ["platform.users.manage"],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 4. ACCESS MANAGEMENT
  // =====================================================
  {
    id: "access",
    label: "Access Management",
    icon: ShieldCheck,
    route: "/platform/access",
    accountTypes: ["platform"],
    defaultItemId: "roles-permissions",

    sections: [
      {
        id: "access-control",
        title: "ACCESS CONTROL",

        items: [
          {
            id: "roles-permissions",
            label: "Roles & Permissions",
            icon: ShieldCheck,
            route: "/platform/access/roles",
            description: "Configure roles and permissions.",
            accountTypes: ["platform"],
            permissions: ["platform.roles.view"],
          },

          {
            id: "role-assignments",
            label: "Role Assignments",
            icon: KeyRound,
            route: "/platform/access/assignments",
            description: "Manage role assignments across the platform.",
            accountTypes: ["platform"],
            permissions: ["platform.role-assignments.view"],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 5. CONFIGURATION
  // =====================================================
  {
    id: "configuration",
    label: "Configuration",
    icon: Settings,
    route: "/platform/configuration",
    accountTypes: ["platform"],
    defaultItemId: "academic-settings",

    sections: [
      {
        id: "academic",
        title: "ACADEMIC CONFIGURATION",

        items: [
          {
            id: "academic-settings",
            label: "Academic Settings",
            icon: GraduationCap,
            route: "/platform/configuration/academic",
            description: "Configure academic settings.",
            accountTypes: ["platform"],
            permissions: ["platform.configuration.academic"],
          },
        ],
      },

      {
        id: "system",
        title: "SYSTEM",

        items: [
          {
            id: "system-settings",
            label: "System Settings",
            icon: Settings,
            route: "/platform/configuration/system",
            description: "Manage platform-wide system settings.",
            accountTypes: ["platform"],
            permissions: ["platform.configuration.system"],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 6. ADMINISTRATION
  // =====================================================
  {
    id: "administration",
    label: "Administration",
    icon: ClipboardList,
    route: "/platform/administration",
    accountTypes: ["platform"],
    defaultItemId: "audit-logs",

    sections: [
      {
        id: "administration",
        title: "ADMINISTRATION",

        items: [
          {
            id: "audit-logs",
            label: "Audit Logs",
            icon: ClipboardList,
            route: "/platform/administration/audit-logs",
            description:
              "Review platform activities and audit records.",
            accountTypes: ["platform"],
            permissions: ["platform.audit-logs.view"],
          },

          {
            id: "system-health",
            label: "System Health",
            icon: Activity,
            route: "/platform/administration/system-health",
            description: "Monitor application and service health.",
            accountTypes: ["platform"],
            permissions: ["platform.system-health.view"],
          },
        ],
      },
    ],
  },
];
