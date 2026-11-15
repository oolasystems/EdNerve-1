
export type TenantStatus = "active" | "inactive";

export type InstitutionType =
  | "university"
  | "college"
  | "college_group"
  | "autonomous_college"
  | "other";

export interface Tenant {
  id: number;
  code: string;
  name: string;
  slug: string;
  institution_type: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  logo_path: string | null;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
  users_count: number;
  active_users_count: number;
  inactive_users_count?: number;
  organization_units_count: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface TenantListParams {
  search?: string;
  status?: TenantStatus | "all";
  institution_type?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface CreateTenantPayload {
  tenant: {
    code: string;
    name: string;
    slug: string;
    institution_type: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country: string;
  };

  initial_admin: {
    name: string;
    email: string;
    phone?: string | null;
    password: string;
  };
}

export interface CreateTenantResponse {
  message: string;
  tenant: Tenant;
  tenant_admin: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    account_type: string;
    tenant_id: number;
    role: unknown;
  };
}