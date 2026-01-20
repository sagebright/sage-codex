/**
 * Shared types for dagger-app
 *
 * This package contains TypeScript type definitions shared between
 * the web frontend and mcp-bridge backend.
 */

/**
 * API health check response
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

/**
 * Generic API error response
 */
export interface ApiError {
  code: string;
  message: string;
}
