import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import { ROUTE_PATHS } from "./route-paths";

function SessionLoading() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p>Restoring your session...</p>
      </div>
    </div>
  );
}

/**
 * Handles the login route.
 *
 * Once a Platform Admin successfully logs in,
 * redirect them to the Platform Admin dashboard.
 */
export function LoginRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (
    isAuthenticated &&
    user?.account_type === "platform" &&
    user.tenant_id === null
  ) {
    return (
      <Navigate
        to={ROUTE_PATHS.platform.dashboard}
        replace
      />
    );
  }

  return <LoginPage />;
}

/**
 * Handles the application root route.
 */
export function HomeRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={ROUTE_PATHS.login}
        replace
      />
    );
  }

  if (
    user.account_type === "platform" &&
    user.tenant_id === null
  ) {
    return (
      <Navigate
        to={ROUTE_PATHS.platform.dashboard}
        replace
      />
    );
  }

  // Institution workspace routing will be added
  // when its workspace routes are implemented.
  return (
    <Navigate
      to={ROUTE_PATHS.login}
      replace
    />
  );
}