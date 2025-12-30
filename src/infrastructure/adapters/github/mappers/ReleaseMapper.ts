import { RepositoryTag } from '@/domain/ports/RepositoryProvider';

/**
 * Maps GitHub API tag responses to domain RepositoryTag objects
 */
export class ReleaseMapper {
  /**
   * Map GitHub API tag to RepositoryTag
   * @param apiTag - GitHub API tag object
   * @returns RepositoryTag domain object
   */
  static mapTag(apiTag: any): RepositoryTag {
    return {
      name: apiTag.name,
      date: new Date(apiTag.commit?.committer?.date || apiTag.commit?.author?.date || new Date()),
    };
  }

  /**
   * Map array of GitHub API tags to RepositoryTag array
   * @param apiTags - Array of GitHub API tag objects
   * @returns Array of RepositoryTag domain objects
   */
  static mapTags(apiTags: any[]): RepositoryTag[] {
    return apiTags.map(tag => this.mapTag(tag));
  }
}
