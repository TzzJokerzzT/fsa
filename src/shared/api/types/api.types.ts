/**
 * API Types - Base types for API communication
 * Single Responsibility: Define common API structures
 */

// API Error Response
export interface ApiError {
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

// API Success Response wrapper (for mutations)
export interface ApiMessage {
  message: string;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
