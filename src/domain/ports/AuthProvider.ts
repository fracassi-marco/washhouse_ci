import { User } from '../models/User';

/**
 * Authentication provider port (interface)
 * Defines the contract for authentication operations
 * Implementations will be in the infrastructure layer
 */
export interface AuthProvider {
  /**
   * Gets the currently authenticated user
   * @returns User if authenticated, null otherwise
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Validates if an email belongs to an allowed domain
   * @param email - Email address to validate
   * @param allowedDomain - Domain to check against
   * @returns true if email matches the domain
   */
  validateDomain(email: string, allowedDomain: string): boolean;

  /**
   * Checks if authentication is enabled via feature flag
   * @returns true if authentication is required
   */
  isAuthEnabled(): boolean;
}
