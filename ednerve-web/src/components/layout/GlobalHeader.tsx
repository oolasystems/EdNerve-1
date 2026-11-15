
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  CircleHelp,
  UserCircle,
  ChevronDown,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import type { AuthUser } from "../../types/auth";
import logo from "../../assets/brand/oolaednerve-logo.svg";

type ActiveMenu = "notifications" | "help" | "profile" | null;

interface GlobalHeaderProps {
  onMenuClick: () => void;
  user: AuthUser;
  onLogout: () => Promise<void>;
}

const GlobalHeader = ({
  onMenuClick,
  user,
  onLogout,
}: GlobalHeaderProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);

  const headerActionsRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: Exclude<ActiveMenu, null>) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        headerActionsRef.current &&
        !headerActionsRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setActiveMenu(null);
    void onLogout();
  };

  return (
    <header className="global-header">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={23} />
      </button>

      <div className="header-brand">
        <a href="/" aria-label="OolaEdNerve home">
          <img
            src={logo}
            alt="OolaEdNerve"
            className="header-logo"
          />
        </a>
      </div>

      <div className="header-actions" ref={headerActionsRef}>
        {/* Global Search */}
        <div className="header-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            aria-label="Global search"
          />

          {searchValue && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => setSearchValue("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="header-menu-container">
          <button
            type="button"
            className="header-icon-button"
            onClick={() => toggleMenu("notifications")}
            aria-label="Notifications"
            aria-expanded={activeMenu === "notifications"}
          >
            <Bell size={19} />
            <span className="notification-indicator" />
          </button>

          {activeMenu === "notifications" && (
            <div className="header-dropdown">
              <strong>Notifications</strong>
              <p className="dropdown-empty">
                No new notifications.
              </p>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="header-menu-container">
          <button
            type="button"
            className="header-icon-button"
            onClick={() => toggleMenu("help")}
            aria-label="Help and support"
            aria-expanded={activeMenu === "help"}
          >
            <CircleHelp size={19} />
          </button>

          {activeMenu === "help" && (
            <div className="header-dropdown">
              <strong>Help & Support</strong>
              <p className="dropdown-empty">
                Help resources will be available here.
              </p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="header-menu-container">
          <button
            type="button"
            className="header-profile-button"
            onClick={() => toggleMenu("profile")}
            aria-expanded={activeMenu === "profile"}
            aria-label="Open profile menu"
          >
            <UserCircle size={22} />
            <span className="profile-label">{user.name}</span>
            <ChevronDown size={15} />
          </button>

          {activeMenu === "profile" && (
            <div className="header-dropdown profile-dropdown">
              <div className="profile-dropdown-heading">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <span>Platform Administrator</span>
              </div>

              <div className="dropdown-divider" />

              <button type="button" disabled>
                <UserCircle size={16} />
                My Profile
              </button>

              <button type="button" disabled>
                <Settings size={16} />
                Account Settings
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
