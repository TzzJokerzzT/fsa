/**
 * Architecture Service - Architecture API endpoints
 * Single Responsibility: Handle architecture-related API calls
 */

import { api } from '@/shared/api/client';
import type {
  ApiMessage,
  Architecture,
  ArchitectureListResponse,
  CreateArchitectureRequest,
  PaginationParams,
  UpdateArchitectureRequest,
} from '@/shared/api/types';

const ARCHITECTURES_BASE = '/architectures';

export const architectureService = {
  /**
   * List current user's architectures with pagination
   */
  list: (params?: PaginationParams) =>
    api.get<ArchitectureListResponse>(ARCHITECTURES_BASE, { params }),

  /**
   * Get a single architecture by ID
   */
  getById: (id: string) => api.get<Architecture>(`${ARCHITECTURES_BASE}/${id}`),

  /**
   * Create a new architecture
   */
  create: (data: CreateArchitectureRequest) =>
    api.post<Architecture>(ARCHITECTURES_BASE, data),

  /**
   * Update an existing architecture
   */
  update: (id: string, data: UpdateArchitectureRequest) =>
    api.put<Architecture>(`${ARCHITECTURES_BASE}/${id}`, data),

  /**
   * Delete an architecture
   */
  delete: (id: string) => api.delete<ApiMessage>(`${ARCHITECTURES_BASE}/${id}`),
};
