/**
 * Generate a unique ID
 * Uses crypto.randomUUID for better uniqueness
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a short ID for display purposes
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 9);
}
