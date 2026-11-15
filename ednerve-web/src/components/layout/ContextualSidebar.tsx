
import { platformAdminNavigation } from "../../config/navigation/platform-admin.navigation";

import type {
  NavigationArea,
  NavigationItem,
} from "../../config/navigation/navigation.types";

interface ContextualSidebarProps {
  activeArea: NavigationArea;
  activeItemId: string;
  onItemSelect: (item: NavigationItem) => void;
}

const ContextualSidebar = ({
  activeArea,
  activeItemId,
  onItemSelect,
}: ContextualSidebarProps) => {
  const configuration = platformAdminNavigation.find(
    (area) => area.id === activeArea
  );

  if (!configuration) {
    return null;
  }

  return (
    <aside className="contextual-sidebar">
      <div className="sidebar-heading">
        <h2>{configuration.label}</h2>
      </div>

      <nav
        className="contextual-sidebar-navigation"
        aria-label={`${configuration.label} navigation`}
      >
        {configuration.sections.map((section) => (
          <section
            className="sidebar-section"
            key={section.id}
          >
            <h3 className="sidebar-section-title">
              {section.title}
            </h3>

            <div className="sidebar-section-items">
              {section.items
                .filter((item) =>
                  item.accountTypes.includes("platform")
                )
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItemId === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`sidebar-nav-item ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => onItemSelect(item)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
};

export default ContextualSidebar;
