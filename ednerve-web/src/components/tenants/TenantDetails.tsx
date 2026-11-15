
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Users,
  UserCheck,
  UserX,
  Network,
  MapPin,
  Mail,
  Phone,
  Globe,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  UserRound,
} from "lucide-react";

import { tenantService } from "../../services/tenant-service";
import type { Tenant } from "../../types/tenant";

interface TenantDetailsProps {
  tenantId: number;
  onBack: () => void;
}

interface TenantAdmin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
}

function formatInstitutionType(type: string): string {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TenantDetails({ tenantId, onBack }: TenantDetailsProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [admin, setAdmin] = useState<TenantAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await tenantService.getTenant(tenantId);
      setTenant(response.tenant);
      setAdmin(response.tenant_admin);
    } catch (err) {
      console.error("Unable to load institution details:", err);
      setError("Unable to load institution details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="tenant-details-state">
        <RefreshCw size={25} className="tenant-spinning" />
        <p>Loading institution details...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="tenant-details-state tenant-details-error">
        <AlertCircle size={28} />
        <p>{error || "Institution not found."}</p>
        <button className="btn btn-secondary" onClick={loadDetails}>
          Retry
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Directory
        </button>
      </div>
    );
  }

  const location = [
    tenant.city,
    tenant.state,
    tenant.country,
  ].filter(Boolean).join(", ");

  const statistics = [
    {
      label: "Total Users",
      value: tenant.users_count,
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Users",
      value: tenant.active_users_count,
      icon: UserCheck,
      color: "green",
    },
    {
      label: "Inactive Users",
      value:
        tenant.inactive_users_count ??
        Math.max(0, tenant.users_count - tenant.active_users_count),
      icon: UserX,
      color: "orange",
    },
    {
      label: "Organization Units",
      value: tenant.organization_units_count,
      icon: Network,
      color: "purple",
    },
  ];

  return (
    <div className="tenant-details">

      <div className="tenant-details-toolbar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to Directory
        </button>
      </div>

      {/* Institution Identity */}
      <section className="tenant-details-profile">
        <div className="tenant-details-profile-icon">
          <Building2 size={30} />
        </div>

        <div className="tenant-details-profile-info">
          <h2>{tenant.name}</h2>
          <div className="tenant-details-profile-meta">
            <span>{tenant.code}</span>
            <span className="tenant-type-label">
              {formatInstitutionType(tenant.institution_type)}
            </span>
            <span className={`tenant-status tenant-status-${tenant.status}`}>
              <span />
              {tenant.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      {/* Institution Statistics */}
      <div className="tenant-details-statistics">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div className="tenant-details-stat-card" key={item.label}>
              <div className={`tenant-details-stat-icon ${item.color}`}>
                <Icon size={21} />
              </div>
              <div>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institution Profile */}
      <section className="tenant-details-section">
        <div className="tenant-details-section-heading">
          <Building2 size={19} />
          <h3>Institution Profile</h3>
        </div>

        <div className="tenant-details-grid">
          <div className="tenant-details-field">
            <label>Institution Name</label>
            <strong>{tenant.name}</strong>
          </div>

          <div className="tenant-details-field">
            <label>Institution Code</label>
            <strong>{tenant.code}</strong>
          </div>

          <div className="tenant-details-field">
            <label>Institution Type</label>
            <strong>{formatInstitutionType(tenant.institution_type)}</strong>
          </div>

          <div className="tenant-details-field">
            <label>URL Slug</label>
            <strong>{tenant.slug}</strong>
          </div>

          <div className="tenant-details-field">
            <label>Official Email</label>
            <strong>
              {tenant.email || "Not specified"}
            </strong>
          </div>

          <div className="tenant-details-field">
            <label>Contact Phone</label>
            <strong>
              {tenant.phone || "Not specified"}
            </strong>
          </div>

          <div className="tenant-details-field">
            <label>Website</label>
            {tenant.website ? (
              <a href={tenant.website} target="_blank" rel="noreferrer">
                {tenant.website}
                <Globe size={14} />
              </a>
            ) : (
              <strong>Not specified</strong>
            )}
          </div>

          <div className="tenant-details-field">
            <label>Address</label>
            <strong>{tenant.address || "Not specified"}</strong>
          </div>

          <div className="tenant-details-field">
            <label>Location</label>
            <strong>
              {location || "Not specified"}
              {location && <MapPin size={14} />}
            </strong>
          </div>

          <div className="tenant-details-field">
            <label>Country</label>
            <strong>{tenant.country}</strong>
          </div>

          <div className="tenant-details-field">
            <label>Created On</label>
            <strong>
              <CalendarDays size={14} />
              {formatDate(tenant.created_at)}
            </strong>
          </div>
        </div>
      </section>

      {/* Initial Administrator */}
      <section className="tenant-details-section">
        <div className="tenant-details-section-heading">
          <UserRound size={19} />
          <h3>Institution Administrator</h3>
        </div>

        {admin ? (
          <div className="tenant-admin-card">
            <div className="tenant-admin-avatar">
              <UserRound size={23} />
            </div>

            <div className="tenant-admin-info">
              <strong>{admin.name}</strong>
              <span>
                <Mail size={14} />
                {admin.email}
              </span>
              <span>
                <Phone size={14} />
                {admin.phone || "Phone not specified"}
              </span>
            </div>

            <span className={`tenant-status tenant-status-${admin.status}`}>
              <span />
              {admin.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <p className="tenant-details-empty">
            No institution administrator found.
          </p>
        )}
      </section>

    </div>
  );
}

export default TenantDetails;
