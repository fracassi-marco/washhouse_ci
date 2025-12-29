import { getServerSession } from 'next-auth';
import { AuthProvider } from '@/domain/ports/AuthProvider';
import { User } from '@/domain/models/User';
import { EnvironmentConfig } from '@/infrastructure/config';

/**
 * NextAuth implementation of AuthProvider
 * Handles authentication using NextAuth.js with Google OAuth
 */
export class NextAuthProvider implements AuthProvider {
  /**
   * Gets the currently authenticated user from the session
   */
  async getCurrentUser(): Promise<User | null> {
    // If auth is disabled, return a mock user for development
    if (!this.isAuthEnabled()) {
      return new User(
        'dev-user',
        'developer@localhost',
        'Development User'
      );
    }

    try {
      const session = await getServerSession();
      
      if (!session?.user?.email) {
        return null;
      }

      return new User(
        session.user.email, // Use email as ID for now
        session.user.email,
        session.user.name || null
      );
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Validates if an email belongs to an allowed domain
   * Note: Currently not enforced, all Google accounts are allowed
   */
  validateDomain(email: string, allowedDomain: string): boolean {
    if (!email || !allowedDomain) {
      return false;
    }
    return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
  }

  /**
   * Checks if authentication is enabled via feature flag
   */
  isAuthEnabled(): boolean {
    return EnvironmentConfig.AUTH_ENABLED;
  }
}
