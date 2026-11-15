import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function PlatformAdminGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait until the existing session restoration is complete.
  if (isLoading) {
    return (
      <div className="page-container page-container-centered">
        <div className="page-card page-card-auth">
          <p>Restoring your session...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Only Platform Admin accounts can access this workspace.
  if (
    user.account_type !== "platform" ||
    user.tenant_id !== null
  ) {
    return (
      <div className="page-container page-container-centered">
        <div className="page-card page-card-auth">
          <h2>Access Denied</h2>
          <p>
            Your account does not have permission to access
            the Platform Administration workspace.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}