import { RepositoryProvider } from '@/domain/ports/RepositoryProvider';
import { Logger } from '@/domain/ports/Logger';
import { Repository } from '@/domain/models/Repository';
import { ReleaseCalculator } from '@/domain/services/ReleaseCalculator';

/**
 * Use case: Fetch repository data enriched with release information
 * Orchestrates fetching repository and its tags/releases
 */
export class FetchRepositoryData {
  constructor(
    private repositoryProvider: RepositoryProvider,
    private logger: Logger
  ) {}

  /**
   * Executes the use case to fetch repository with release data
   * @param repository - Base repository to enrich
   * @returns Repository with release statistics
   */
  async execute(repository: Repository): Promise<Repository> {
    this.logger.debug('Fetching release data for repository', {
      repo: repository.name,
      owner: repository.owner,
    });

    try {
      // Fetch tags from provider
      const tags = await this.repositoryProvider.getRepositoryTags(
        repository.owner,
        repository.name
      );

      // Parse tags into releases
      const releases = ReleaseCalculator.parseTags(tags);

      // Calculate release statistics
      const releaseStats = ReleaseCalculator.calculateStats(releases);

      // Return new repository with release stats
      return new Repository(
        repository.name,
        repository.owner,
        repository.url,
        repository.description,
        repository.language,
        repository.starCount,
        repository.updatedAt,
        releaseStats
      );
    } catch (error) {
      this.logger.warn('Failed to fetch release data, returning repository without stats', {
        repo: repository.name,
        error,
      });
      
      // Return original repository if release fetch fails
      return repository;
    }
  }
}
