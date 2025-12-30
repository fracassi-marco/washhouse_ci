import { Repository } from '../models/Repository';
import { Release } from '../models/Release';

/**
 * Tag data from repository provider
 */
export interface RepositoryTag {
  name: string;
  date: Date;
}

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

  /**
   * Gets tags/releases for a specific repository
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Array of tags
   */
  getRepositoryTags(owner: string, repo: string): Promise<RepositoryTag[]>;
}
