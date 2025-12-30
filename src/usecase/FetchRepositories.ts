import { RepositoryProvider } from '@/domain/ports/RepositoryProvider';
import { Logger } from '@/domain/ports/Logger';
import { Repository } from '@/domain/models/Repository';
import { FetchRepositoryData } from './FetchRepositoryData';

/**
 * Use case: Fetch repositories for an organization
 * Orchestrates repository data fetching using the provider
 */
export class FetchRepositories {
  constructor(
    private repositoryProvider: RepositoryProvider,
    private logger: Logger
  ) {}

  /**
   * Executes the use case to fetch repositories with release data
   * @param orgName - GitHub organization name
   * @param includeReleaseData - Whether to fetch release data for each repo (default: true)
   * @returns Array of repositories with release statistics
   */
  async execute(orgName: string, includeReleaseData: boolean = true): Promise<Repository[]> {
    this.logger.info('Fetching repositories', { organization: orgName, includeReleaseData });

    try {
      const repositories = await this.repositoryProvider.listRepositories(orgName);
      
      this.logger.info('Successfully fetched repositories', {
        organization: orgName,
        count: repositories.length,
      });

      // If release data is not needed, return repositories as-is
      if (!includeReleaseData) {
        return repositories;
      }

      // Enrich each repository with release data
      const fetchRepositoryData = new FetchRepositoryData(this.repositoryProvider, this.logger);
      
      const enrichedRepositories = await Promise.all(
        repositories.map(repo => fetchRepositoryData.execute(repo))
      );

      this.logger.info('Successfully enriched repositories with release data', {
        organization: orgName,
        count: enrichedRepositories.length,
      });

      return enrichedRepositories;
    } catch (error) {
      this.logger.error(
        'Failed to fetch repositories',
        { error, organization: orgName }
      );
      throw error;
    }
  }
}
