/**
 * Auth Types - Authentication related API types
 * Mirrors backend DTOs for type safety
 */

// User data returned in auth responses
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Token pair
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response — backend nests tokens: { user, tokens: { accessToken, refreshToken } }
export interface LoginResponse {
  user: AuthUser;
  tokens: Tokens;
}

// Register request payload
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Register response
export interface RegisterResponse {
  user: AuthUser;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
