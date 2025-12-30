import { RepositoryProvider, RepositoryTag } from '@/domain/ports/RepositoryProvider';
import { Repository } from '@/domain/models/Repository';
import { OctokitClient } from './OctokitClient';
import { RepositoryMapper } from './mappers/RepositoryMapper';
import { ReleaseMapper } from './mappers/ReleaseMapper';

/**
 * GitHub implementation of RepositoryProvider
 * Fetches repository data from GitHub API
 */
export class GitHubRepositoryProvider implements RepositoryProvider {
  constructor(
    private octokitClient: OctokitClient,
    private orgName: string
  ) {}

  /**
   * Lists all repositories for the configured organization
   */
  async listRepositories(orgName?: string): Promise<Repository[]> {
    const targetOrg = orgName || this.orgName;

    if (!targetOrg) {
      throw new Error('Organization name is required');
    }

    try {
      const octokit = this.octokitClient.getClient();
      
      // Fetch all repos for the organization
      const { data: repos } = await octokit.repos.listForOrg({
        org: targetOrg,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return RepositoryMapper.toDomainList(repos);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Organization '${targetOrg}' not found`);
      }
      if (error.status === 401) {
        throw new Error('GitHub authentication failed. Check your token.');
      }
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  /**
   * Gets tags/releases for a specific repository
   */
  async getRepositoryTags(owner: string, repo: string): Promise<RepositoryTag[]> {
    try {
      const octokit = this.octokitClient.getClient();
      
      // Fetch tags for the repository
      const { data: tags } = await octokit.repos.listTags({
        owner,
        repo,
        per_page: 100, // Get up to 100 most recent tags
      });

      return ReleaseMapper.mapTags(tags);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository '${owner}/${repo}' not found`);
      }
      if (error.status === 401) {
        throw new Error('GitHub authentication failed. Check your token.');
      }
      throw new Error(`Failed to fetch tags for ${owner}/${repo}: ${error.message}`);
    }
  }
}
