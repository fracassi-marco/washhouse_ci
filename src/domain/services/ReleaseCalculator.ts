import { Release, ReleaseStats, SemanticVersion } from '../models/Release';

/**
 * Service for calculating release statistics
 * Pure domain service with no external dependencies
 */
export class ReleaseCalculator {
  /**
   * Calculate statistics from a list of releases
   * @param releases - List of releases sorted by date (newest first)
   * @returns Release statistics
   */
  static calculateStats(releases: Release[]): ReleaseStats {
    if (releases.length === 0) {
      return new ReleaseStats(0, 0, null, null, null);
    }

    const semanticReleases = this.filterSemanticVersions(releases);
    const latestRelease = releases[0]; // Assumes sorted by date descending
    const latestSemanticRelease = semanticReleases.length > 0 ? semanticReleases[0] : null;
    const daysSinceLatest = this.calculateDaysSince(latestRelease.date);

    return new ReleaseStats(
      releases.length,
      semanticReleases.length,
      latestRelease,
      latestSemanticRelease,
      daysSinceLatest
    );
  }

  /**
   * Filter releases to only include those with semantic versions
   * @param releases - List of releases
   * @returns Releases with semantic versions only
   */
  static filterSemanticVersions(releases: Release[]): Release[] {
    return releases.filter(release => release.hasSemanticVersion());
  }

  /**
   * Calculate days since a given date
   * @param date - The date to calculate from
   * @returns Number of days since the date
   */
  static calculateDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Parse tags into Release objects
   * @param tags - Array of tag objects with name and date
   * @returns Array of Release objects sorted by date descending
   */
  static parseTags(tags: Array<{ name: string; date: Date }>): Release[] {
    return tags
      .map(tag => {
        const version = SemanticVersion.parse(tag.name);
        return new Release(tag.name, tag.date, version);
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get the latest N releases
   * @param releases - List of releases
   * @param count - Number of releases to return
   * @returns Latest N releases
   */
  static getLatestReleases(releases: Release[], count: number): Release[] {
    return releases.slice(0, count);
  }

  /**
   * Check if a release is recent (within specified days)
   * @param release - The release to check
   * @param days - Number of days to consider recent
   * @returns True if release is within specified days
   */
  static isRecentRelease(release: Release, days: number): boolean {
    return release.getDaysSince() <= days;
  }
}
