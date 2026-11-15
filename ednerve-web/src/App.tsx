
import { useEffect, useState } from "react";

import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";

import type { AuthUser } from "./types/auth";

import GlobalHeader from "./components/layout/GlobalHeader";
import PrimaryNavigation from "./components/layout/PrimaryNavigation";
import ContextualSidebar from "./components/layout/ContextualSidebar";
import Workspace from "./components/layout/Workspace";

import { platformAdminNavigation } from "./config/navigation/platform-admin.navigation";

import type {
  NavigationArea,
  NavigationItem,
} from "./config/navigation/navigation.types";

import "./App.css";
import PlatformDashboard from "./components/dashboard/PlatformDashboard";
import TenantDirectory from "./components/tenants/TenantDirectory";
import AddTenant from "./components/tenants/AddTenant";
import TenantDetails from "./components/tenants/TenantDetails";

const initialArea: NavigationArea = "overview";

interface PlatformAdminWorkspaceProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

function PlatformAdminWorkspace({
  user,
  onLogout,
}: PlatformAdminWorkspaceProps) {

  const [activeArea, setActiveArea] =
    useState<NavigationArea>(initialArea);

  const [activeItemId, setActiveItemId] = useState(
    platformAdminNavigation[0].defaultItemId
  );

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeAreaConfig =
    platformAdminNavigation.find(
      (area) => area.id === activeArea
    ) ?? platformAdminNavigation[0];

  const activeItem: NavigationItem =
    activeAreaConfig.sections
      .flatMap((section) => section.items)
      .find((item) => item.id === activeItemId) ??
    activeAreaConfig.sections
      .flatMap((section) => section.items)
      .find(
        (item) => item.id === activeAreaConfig.defaultItemId
      )!;

  // Close mobile navigation using Escape.
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileDrawerOpen]);

  // Prevent background scrolling while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const handleAreaChange = (area: NavigationArea) => {
    const selectedArea = platformAdminNavigation.find(
      (item) => item.id === area
    );

    if (!selectedArea) return;

    setActiveArea(area);
    setActiveItemId(selectedArea.defaultItemId);
    setMobileDrawerOpen(false);
  };

  const handleItemSelect = (item: NavigationItem) => {
    setActiveItemId(item.id);
    setMobileDrawerOpen(false);
  };

  const handleTenantCancel = () => {
    setActiveItemId("tenant-directory");
  };

  const handleTenantCreated = () => {
    setActiveItemId("tenant-directory");
  };

  const handlePageAction = () => {
    if (!activeItem.action) return;

    const targetItem = activeAreaConfig.sections
      .flatMap((section) => section.items)
      .find(
        (item) => item.id === activeItem.action?.targetItemId
      );

    if (targetItem) {
      handleItemSelect(targetItem);
    }
  };

  const handleTenantSelect = (tenantId: number) => {
    setSelectedTenantId(tenantId);
  };

  const ActionIcon = activeItem.action?.icon;

  return (
    <div className="app-container">
      <GlobalHeader
        onMenuClick={() => setMobileDrawerOpen(true)}
        user={user}
        onLogout={onLogout}
      />

      <div className="app-body">
        <PrimaryNavigation
          activeArea={activeArea}
          onAreaChange={handleAreaChange}
        />

        <ContextualSidebar
          activeArea={activeArea}
          activeItemId={activeItem.id}
          onItemSelect={handleItemSelect}
        />

        <Workspace
          breadcrumbs={[
            { label: "Platform Admin" },
            { label: activeAreaConfig.label },
            { label: activeItem.label },
          ]}
          title={activeItem.label}
          description={activeItem.description}
          actions={
            activeItem.action ? (
              <button
                type="button"
                className="workspace-action-button"
                onClick={handlePageAction}
              >
                {ActionIcon && <ActionIcon size={17} />}
                {activeItem.action.label}
              </button>
            ) : undefined
          }
        >

          {activeItem.id === "dashboard" ? (
            <PlatformDashboard />
          ) : activeItem.id === "tenant-directory" ? (
            selectedTenantId !== null ? (
              <TenantDetails
                tenantId={selectedTenantId}
                onBack={() => setSelectedTenantId(null)}
              />
            ) : (
              <TenantDirectory onSelectTenant={handleTenantSelect} />
            )
          ) : activeItem.id === "add-tenant" ? (
            <AddTenant
              onCancel={handleTenantCancel}
              onCreated={handleTenantCreated}
            />
          ) : (
            <div className="workspace-placeholder">
              <p>
                The {activeItem.label} module will be implemented here.
              </p>

              <span>
                This is the standard OolaEdNerve workspace area.
              </span>
            </div>
          )}
        </Workspace>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMobileDrawerOpen(false);
            }
          }}
        >
          <div
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Application navigation"
          >
            <div className="mobile-drawer-header">
              <strong>Navigation</strong>

              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>

            <div className="mobile-drawer-content">
              <PrimaryNavigation
                activeArea={activeArea}
                onAreaChange={handleAreaChange}
              />

              <ContextualSidebar
                activeArea={activeArea}
                activeItemId={activeItem.id}
                onItemSelect={handleItemSelect}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    }
  };

  // Restore authentication session before displaying the application.
  if (isLoading) {
    return (
      <div className="page-container page-container-centered">
        <div className="page-card page-card-auth">
          <p>Restoring your session...</p>
        </div>
      </div>
    );
  }

  // Display login when no authenticated user exists.
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Platform Admin workspace only.
  if (
    user.account_type !== "platform" ||
    user.tenant_id !== null
  ) {
    return <LoginPage />;
  }

  return (
    <PlatformAdminWorkspace
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;
