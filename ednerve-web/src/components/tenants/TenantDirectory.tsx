
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Building2,
    Users,
    Network,
    MapPin,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

import { tenantService } from "../../services/tenant-service";

import type {
    Tenant,
    TenantListParams,
    TenantStatus,
} from "../../types/tenant";

const PAGE_SIZE = 10;

interface TenantDirectoryProps {
    onSelectTenant: (tenantId: number) => void;
}

function formatInstitutionType(type: string): string {
    return type
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TenantDirectory({ onSelectTenant }: TenantDirectoryProps) {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<TenantStatus | "all">("all");
    const [institutionType, setInstitutionType] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [from, setFrom] = useState<number | null>(null);
    const [to, setTo] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTenants = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params: TenantListParams = {
                page: currentPage,
                per_page: PAGE_SIZE,
                sort: "name",
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (status !== "all") {
                params.status = status;
            }

            if (institutionType !== "all") {
                params.institution_type = institutionType;
            }

            const response = await tenantService.getTenants(params);

            setTenants(response.data);
            setCurrentPage(response.current_page);
            setLastPage(response.last_page);
            setTotal(response.total);
            setFrom(response.from);
            setTo(response.to);
        } catch (err) {
            console.error("Unable to load institutions:", err);
            setError(
                "Unable to load institutions. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, status, institutionType]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadTenants();
        }, search ? 400 : 0);

        return () => window.clearTimeout(timer);
    }, [loadTenants, search]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: TenantStatus | "all") => {
        setStatus(value);
        setCurrentPage(1);
    };

    const handleTypeChange = (value: string) => {
        setInstitutionType(value);
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        void loadTenants();
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage) return;
        setCurrentPage(page);
    };

    const getLocation = (tenant: Tenant) => {
        return [tenant.city, tenant.state, tenant.country]
            .filter(Boolean)
            .join(", ");
    };

    return (
        <div className="tenant-directory">
            <div className="tenant-directory-toolbar">
                <div className="tenant-directory-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search by institution name or code..."
                        value={search}
                        onChange={(event) =>
                            handleSearchChange(event.target.value)
                        }
                        aria-label="Search institutions"
                    />
                </div>

                <select
                    className="tenant-directory-filter"
                    value={institutionType}
                    onChange={(event) =>
                        handleTypeChange(event.target.value)
                    }
                    aria-label="Filter by institution type"
                >
                    <option value="all">All Institution Types</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="college_group">College Group</option>
                    <option value="autonomous_college">Autonomous College</option>
                    <option value="other">Other</option>
                </select>

                <select
                    className="tenant-directory-filter"
                    value={status}
                    onChange={(event) =>
                        handleStatusChange(
                            event.target.value as TenantStatus | "all"
                        )
                    }
                    aria-label="Filter by institution status"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    type="button"
                    className="tenant-directory-refresh"
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Refresh institution list"
                >
                    <RefreshCw size={17} className={loading ? "tenant-spinning" : ""} />
                    Refresh
                </button>
            </div>

            <div className="tenant-directory-summary">
                <div>
                    <strong>{total}</strong>
                    <span>Institutions registered</span>
                </div>

                <div>
                    <strong>
                        {tenants.reduce(
                            (sum, tenant) => sum + tenant.users_count,
                            0
                        )}
                    </strong>
                    <span>Users on current page</span>
                </div>

                <div>
                    <strong>
                        {tenants.reduce(
                            (sum, tenant) =>
                                sum + tenant.organization_units_count,
                            0
                        )}
                    </strong>
                    <span>Organization units on current page</span>
                </div>
            </div>

            {error && (
                <div className="tenant-directory-error">
                    <AlertCircle size={19} />
                    <span>{error}</span>
                    <button type="button" onClick={handleRefresh}>
                        Retry
                    </button>
                </div>
            )}

            <div className="tenant-table-container">
                <table className="tenant-table">
                    <thead>
                        <tr>
                            <th>Institution</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Users</th>
                            <th>Organization Units</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="tenant-table-message">
                                    <RefreshCw size={22} className="tenant-spinning" />
                                    <span>Loading institutions...</span>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="tenant-table-message">
                                    Institution records could not be loaded.
                                </td>
                            </tr>
                        ) : tenants.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="tenant-table-message">
                                    No institutions found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td>
                                        <div className="tenant-name-cell">
                                            <div className="tenant-avatar">
                                                <Building2 size={20} />
                                            </div>

                                            <div>
                                                <button
                                                    type="button"
                                                    className="tenant-name-link"
                                                    onClick={() => onSelectTenant(tenant.id)}
                                                >
                                                    {tenant.name}
                                                </button>
                                                <span>{tenant.code}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="tenant-type-label">
                                            {formatInstitutionType(
                                                tenant.institution_type
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="tenant-location-cell">
                                            <MapPin size={15} />
                                            <span>
                                                {getLocation(tenant) || "Not specified"}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="tenant-count-cell">
                                            <Users size={16} />
                                            <div>
                                                <strong>{tenant.users_count}</strong>
                                                <span>
                                                    {tenant.active_users_count} active
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="tenant-count-cell">
                                            <Network size={16} />
                                            <strong>
                                                {tenant.organization_units_count}
                                            </strong>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`tenant-status tenant-status-${tenant.status}`}
                                        >
                                            <span />
                                            {tenant.status === "active"
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="tenant-directory-pagination">
                <span>
                    Showing {from ?? 0}–{to ?? 0} of {total} institutions
                </span>

                <div className="tenant-pagination-controls">
                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <span>
                        Page {currentPage} of {lastPage}
                    </span>

                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage || loading}
                        aria-label="Next page"
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TenantDirectory;
