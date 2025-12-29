import { Octokit } from '@octokit/rest';
import { EnvironmentConfig } from '@/infrastructure/config';

/**
 * GitHub API client wrapper
 * Provides error handling and rate limit management
 */
export class OctokitClient {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || EnvironmentConfig.GITHUB_TOKEN,
      userAgent: 'washhouse-ci-dashboard',
    });
  }

  /**
   * Gets the underlying Octokit instance
   */
  getClient(): Octokit {
    return this.octokit;
  }

  /**
   * Checks if the client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.octokit.auth;
  }

  /**
   * Gets rate limit information
   */
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rateLimit.get();
      return data.rate;
    } catch (error) {
      console.error('Failed to get rate limit:', error);
      return null;
    }
  }
}
