import { Repository } from '../models/Repository';

/**
 * Repository provider port (interface)
 * Defines the contract for repository data operations
 * Implementations will be in the infrastructure layer
 */
export interface RepositoryProvider {
  /**
   * Lists all repositories for an organization
   * @param orgName - GitHub organization name
   * @returns Array of repositories
   */
  listRepositories(orgName: string): Promise<Repository[]>;
}
