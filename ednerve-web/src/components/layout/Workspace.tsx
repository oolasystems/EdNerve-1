
import type { ReactNode } from "react";
import { ChevronRight, House } from "lucide-react";

export interface WorkspaceBreadcrumb {
  label: string;
}

interface WorkspaceProps {
  breadcrumbs: WorkspaceBreadcrumb[];
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
}

const Workspace = ({
  breadcrumbs,
  title,
  description,
  actions,
  children,
}: WorkspaceProps) => {
  return (
    <main className="main-workspace">
      <div className="workspace-container">

        {/* Breadcrumbs */}
        <nav
          className="workspace-breadcrumbs"
          aria-label="Breadcrumb"
        >
          <House size={14} />

          {breadcrumbs.map((breadcrumb, index) => (
            <div
              className="breadcrumb-item"
              key={`${breadcrumb.label}-${index}`}
            >
              <ChevronRight size={14} />

              <span
                aria-current={
                  index === breadcrumbs.length - 1
                    ? "page"
                    : undefined
                }
                className={
                  index === breadcrumbs.length - 1
                    ? "breadcrumb-current"
                    : ""
                }
              >
                {breadcrumb.label}
              </span>
            </div>
          ))}
        </nav>

        {/* Page Header */}
        <div className="workspace-page-header">
          <div className="workspace-page-heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {actions && (
            <div className="workspace-page-actions">
              {actions}
            </div>
          )}
        </div>

        {/* Page Content */}
        <section className="workspace-page-content">
          {children || (
            <div className="workspace-empty-state">
              <p>Page content will appear here.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default Workspace;
