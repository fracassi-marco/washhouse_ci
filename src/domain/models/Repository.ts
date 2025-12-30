import { ReleaseStats } from './Release';

/**
 * Repository domain model
 * Represents a GitHub repository with basic information
 * Pure domain entity with no framework dependencies
 */
export class Repository {
  constructor(
    public readonly name: string,
    public readonly owner: string,
    public readonly url: string,
    public readonly description: string | null,
    public readonly language: string | null,
    public readonly starCount: number = 0,
    public readonly updatedAt: Date = new Date(),
    public readonly releaseStats: ReleaseStats | null = null
  ) {
    if (!name || name.trim() === '' || !owner || owner.trim() === '' || !url) {
      throw new Error('Repository name, owner, and url are required');
    }
    if (!url.startsWith('http')) {
      throw new Error('Invalid repository URL');
    }
    if (starCount < 0) {
      throw new Error('Star count cannot be negative');
    }
  }

  /**
   * Gets the full repository name (owner/repo)
   */
  public getFullName(): string {
    return `${this.owner}/${this.name}`;
  }

  /**
   * Gets a display-friendly description or fallback
   */
  public getDisplayDescription(): string {
    return this.description || 'No description available';
  }

  /**
   * Gets a display-friendly language or fallback
   */
  public getDisplayLanguage(): string {
    return this.language || 'Unknown';
  }

  /**
   * Checks if repository was recently updated (within last 7 days)
   */
  public isRecentlyUpdated(): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.updatedAt >= sevenDaysAgo;
  }

  /**
   * Gets the number of days since last update
   */
  public getDaysSinceUpdate(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Checks if repository has a description
   */
  public hasDescription(): boolean {
    return this.description !== null && this.description.trim() !== '';
  }

  /**
   * Checks if repository has a language
   */
  public hasLanguage(): boolean {
    return this.language !== null;
  }

  /**
   * Checks if repository has release statistics
   */
  public hasReleaseStats(): boolean {
    return this.releaseStats !== null && this.releaseStats.hasReleases();
  }

  /**
   * Gets the latest release version as a string
   */
  public getLatestReleaseVersion(): string | null {
    if (!this.releaseStats?.latestSemanticRelease) {
      return null;
    }
    return this.releaseStats.latestSemanticRelease.version?.toString() || null;
  }
}
