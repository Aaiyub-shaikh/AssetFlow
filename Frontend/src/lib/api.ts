import type { Asset, Allocation, Transfer } from "@/types";

const BASE_URL = "http://localhost:5000/api";

/**
 * Custom error class that passes status codes and extra payload details
 */
export class APIError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Base fetch client wrapper
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let responseData: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  }

  if (!response.ok) {
    // If it's a JSON response, throw the message from the backend, otherwise default text
    const message = responseData?.message || response.statusText || "Request failed";
    throw new APIError(message, response.status, responseData);
  }

  // Expect our backend envelopes to be { success: true, data: ... } or just return the body
  if (responseData && typeof responseData === "object" && "success" in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
}

/**
 * Centralized API client for Assets, Allocations, and Transfers
 */
export const api = {
  // ==========================================
  // MODULE 4: Assets
  // ==========================================
  
  /**
   * Fetch all assets from the directory with search/filters
   */
  async getAssets(params?: {
    search?: string;
    category?: string;
    department?: string;
    status?: string;
    condition?: string;
    location?: string;
  }): Promise<Asset[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const query = searchParams.toString();
    return request<Asset[]>(`/assets${query ? `?${query}` : ""}`);
  },

  /**
   * Fetch a single asset detail page (returns nested history logs)
   */
  async getAssetDetails(idOrTag: string): Promise<Asset & { history?: { allocations: Allocation[]; transfers: Transfer[] } }> {
    return request<Asset & { history?: { allocations: Allocation[]; transfers: Transfer[] } }>(`/assets/${idOrTag}`);
  },

  /**
   * Register a new asset
   */
  async registerAsset(data: Omit<Asset, "id" | "qrCode" | "currentValue">): Promise<Asset> {
    // Generate static values expected by backend (or mock values if not provided)
    const payload = {
      ...data,
      currentValue: data.purchasePrice, // Initial value equals purchase price
      qrCode: data.tag, // QrCode mirrors the tag by default
    };
    return request<Asset>("/assets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an asset
   */
  async updateAsset(idOrTag: string, data: Partial<Asset>): Promise<Asset> {
    return request<Asset>(`/assets/${idOrTag}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an asset
   */
  async deleteAsset(idOrTag: string): Promise<void> {
    return request<void>(`/assets/${idOrTag}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // MODULE 5: Allocation & Transfers
  // ==========================================

  /**
   * Allocate an available asset to an employee
   */
  async allocateAsset(
    assetIdOrTag: string,
    data: {
      employeeId: string;
      employeeName: string;
      department: string;
      returnDate?: string;
      notes?: string;
      conditionOnAllocation?: string;
    }
  ): Promise<Allocation> {
    return request<Allocation>(`/assets/${assetIdOrTag}/allocate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Return an allocated asset
   */
  async returnAsset(
    assetIdOrTag: string,
    data: {
      conditionOnReturn: string;
      notes?: string;
    }
  ): Promise<Allocation> {
    return request<Allocation>(`/assets/${assetIdOrTag}/return`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch all transfer requests
   */
  async getTransfers(status?: string): Promise<Transfer[]> {
    const query = status ? `?status=${status}` : "";
    return request<Transfer[]>(`/transfers${query}`);
  },

  /**
   * Request an asset transfer
   */
  async createTransferRequest(data: {
    assetId: string;
    toDepartment: string;
    requestedBy: string;
    priority: string;
    reason: string;
  }): Promise<Transfer> {
    return request<Transfer>("/transfers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Approve, Reject, Transit, or Complete a transfer request
   */
  async processTransferAction(
    transferId: string,
    action: "approve" | "reject" | "transit" | "complete",
    approvedBy?: string
  ): Promise<Transfer> {
    return request<Transfer>(`/transfers/${transferId}/action`, {
      method: "PUT",
      body: JSON.stringify({ action, approvedBy }),
    });
  },

  /**
   * Retrieve all overdue allocations
   */
  async getOverdueAllocations(): Promise<Allocation[]> {
    return request<Allocation[]>("/allocations/overdue");
  },

  /**
   * Retrieve all allocations
   */
  async getAllAllocations(): Promise<Allocation[]> {
    return request<Allocation[]>("/allocations");
  }
};
