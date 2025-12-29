import { RepositoryProvider } from '@/domain/ports/RepositoryProvider';
import { Logger } from '@/domain/ports/Logger';
import { Repository } from '@/domain/models/Repository';

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
   * Executes the use case to fetch repositories
   * @param orgName - GitHub organization name
   * @returns Array of repositories
   */
  async execute(orgName: string): Promise<Repository[]> {
    this.logger.info('Fetching repositories', { organization: orgName });

    try {
      const repositories = await this.repositoryProvider.listRepositories(orgName);
      
      this.logger.info('Successfully fetched repositories', {
        organization: orgName,
        count: repositories.length,
      });

      return repositories;
    } catch (error) {
      this.logger.error(
        'Failed to fetch repositories',
        { error, organization: orgName }
      );
      throw error;
    }
  }
}
