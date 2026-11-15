
import { platformAdminNavigation } from "../../config/navigation/platform-admin.navigation";

import type { NavigationArea } from "../../config/navigation/navigation.types";

interface PrimaryNavigationProps {
  activeArea: NavigationArea;
  onAreaChange: (area: NavigationArea) => void;
}

const PrimaryNavigation = ({
  activeArea,
  onAreaChange,
}: PrimaryNavigationProps) => {
  return (
    <nav
      className="primary-navigation"
      aria-label="Primary navigation"
    >
      <div className="primary-navigation-items">
        {platformAdminNavigation
          .filter((area) => area.accountTypes.includes("platform"))
          .map((area) => {
            const Icon = area.icon;
            const isActive = activeArea === area.id;

            return (
              <button
                key={area.id}
                type="button"
                className={`primary-nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => onAreaChange(area.id)}
                title={area.label}
                aria-label={area.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />

                <span className="primary-nav-tooltip">
                  {area.label}
                </span>
              </button>
            );
          })}
      </div>
    </nav>
  );
};

export default PrimaryNavigation;
