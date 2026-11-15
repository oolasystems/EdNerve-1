
import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Users,
  UserCheck,
  University,
  RefreshCw,
  Activity,
  AlertCircle,
} from "lucide-react";

import { dashboardService } from "../../services/dashboard-service";

import type {
  DashboardResponse,
} from "../../types/dashboard";

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: string;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: MetricCardProps) {
  return (
    <div className="dashboard-metric-card">
      <div className={`dashboard-metric-icon ${color}`}>
        <Icon size={22} />
      </div>

      <div className="dashboard-metric-details">
        <p className="dashboard-metric-title">{title}</p>
        <h2>{value.toLocaleString("en-IN")}</h2>
        <span>{description}</span>
      </div>
    </div>
  );
}

function PlatformDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getDashboard();
      setData(response);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Unable to load dashboard information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-state">
        <RefreshCw size={22} className="dashboard-spinner" />
        <p>Loading platform dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-state">
        <AlertCircle size={28} className="dashboard-error-icon" />
        <p>{error ?? "Dashboard information is unavailable."}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void loadDashboard()}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const summary = data.summary;

  const typeTotal = data.institution_statistics.by_type.reduce(
    (total, item) => total + item.total,
    0
  );

  const statusTotal = data.institution_statistics.by_status.reduce(
    (total, item) => total + item.total,
    0
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-toolbar">
        <div>
          <p className="dashboard-updated-label">
            Platform overview
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void loadDashboard()}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="dashboard-metrics-grid">
        <MetricCard
          title="Total Institutions"
          value={summary.total_institutions}
          description="Registered institutions"
          icon={University}
          color="blue"
        />

        <MetricCard
          title="Active Institutions"
          value={summary.active_institutions}
          description="Currently active"
          icon={CheckCircle2}
          color="green"
        />

        <MetricCard
          title="Inactive Institutions"
          value={summary.inactive_institutions}
          description="Currently inactive"
          icon={Building2}
          color="orange"
        />

        <MetricCard
          title="Total Institution Users"
          value={summary.total_institution_users}
          description="Users across institutions"
          icon={Users}
          color="purple"
        />

        <MetricCard
          title="Active Institution Users"
          value={summary.active_institution_users}
          description="Currently active users"
          icon={UserCheck}
          color="teal"
        />
      </div>

      <div className="dashboard-statistics-grid">
        <section className="page-card dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h3>Institutions by Type</h3>
              <p>Distribution across institution categories</p>
            </div>
            <University size={20} />
          </div>

          {data.institution_statistics.by_type.length === 0 ? (
            <p className="dashboard-empty-text">
              No institution type statistics available.
            </p>
          ) : (
            <div className="dashboard-stat-list">
              {data.institution_statistics.by_type.map((item) => (
                <div className="dashboard-stat-item" key={item.type}>
                  <div className="dashboard-stat-label">
                    <span>{item.type.replaceAll("_", " ")}</span>
                    <strong>{item.total}</strong>
                  </div>

                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill blue"
                      style={{
                        width: `${
                          typeTotal > 0
                            ? (item.total / typeTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="page-card dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h3>Institutions by Status</h3>
              <p>Current institution status overview</p>
            </div>
            <Activity size={20} />
          </div>

          {data.institution_statistics.by_status.length === 0 ? (
            <p className="dashboard-empty-text">
              No institution status statistics available.
            </p>
          ) : (
            <div className="dashboard-stat-list">
              {data.institution_statistics.by_status.map((item) => (
                <div className="dashboard-stat-item" key={item.status}>
                  <div className="dashboard-stat-label">
                    <span>{item.status}</span>
                    <strong>{item.total}</strong>
                  </div>

                  <div className="dashboard-progress-track">
                    <div
                      className={`dashboard-progress-fill ${
                        item.status === "active" ? "green" : "orange"
                      }`}
                      style={{
                        width: `${
                          statusTotal > 0
                            ? (item.total / statusTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="page-card dashboard-panel dashboard-activities">
        <div className="dashboard-panel-heading">
          <div>
            <h3>Recent Activities</h3>
            <p>Latest platform administration activities</p>
          </div>
          <Activity size={20} />
        </div>

        {data.recent_activities.length === 0 ? (
          <div className="dashboard-empty-state">
            <Activity size={30} />
            <strong>No recent activities</strong>
            <p>
              Platform activity records will appear here when
              audit logging is implemented.
            </p>
          </div>
        ) : (
          <div className="dashboard-empty-text">
            Activity records are available. Their display will be
            integrated when the audit activity structure is defined.
          </div>
        )}
      </section>
    </div>
  );
}

export default PlatformDashboard;
