import apiClient from "../lib/api-client";

import type {
  PaginatedResponse,
  Tenant,
  TenantListParams,
  CreateTenantPayload,
  CreateTenantResponse,
} from "../types/tenant";

export const tenantService = {
  async getTenants(
    params: TenantListParams = {}
  ): Promise<PaginatedResponse<Tenant>> {
    const response = await apiClient.get<PaginatedResponse<Tenant>>(
      "/platform/tenants",
      { params }
    );

    return response.data;
  },

  async getTenant(id: number): Promise<{
    tenant: Tenant;
    tenant_admin: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      status: string;
    } | null;
  }> {
    const response = await apiClient.get(`/platform/tenants/${id}`);

    return response.data;
  },

  async createTenant(
    payload: CreateTenantPayload
  ): Promise<CreateTenantResponse> {
    const response = await apiClient.post<CreateTenantResponse>(
      "/platform/tenants",
      payload
    );

    return response.data;
  },
};