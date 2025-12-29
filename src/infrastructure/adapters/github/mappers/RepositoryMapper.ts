import { Repository } from '@/domain/models/Repository';

/**
 * Maps GitHub API repository response to domain Repository model
 */
export class RepositoryMapper {
  /**
   * Maps a GitHub repository object to domain Repository
   */
  static toDomain(githubRepo: any): Repository {
    return new Repository(
      githubRepo.name,
      githubRepo.owner?.login || 'unknown',
      githubRepo.html_url,
      githubRepo.description || null,
      githubRepo.language || null,
      githubRepo.stargazers_count || 0,
      githubRepo.updated_at ? new Date(githubRepo.updated_at) : new Date()
    );
  }

  /**
   * Maps an array of GitHub repositories to domain Repositories
   */
  static toDomainList(githubRepos: any[]): Repository[] {
    return githubRepos.map(repo => this.toDomain(repo));
  }
}
