/**
 * Represents a semantic version number
 */
export class SemanticVersion {
  constructor(
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number,
    public readonly preRelease?: string
  ) {}

  /**
   * Parse a version string into a SemanticVersion
   * @param version - Version string (e.g., "v1.2.3", "1.2.3-beta")
   * @returns SemanticVersion or null if invalid
   */
  static parse(version: string): SemanticVersion | null {
    // Remove leading 'v' if present
    const cleanVersion = version.replace(/^v/, '');
    
    // Match semantic version pattern: major.minor.patch[-prerelease]
    const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    
    if (!match) {
      return null;
    }

    return new SemanticVersion(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4]
    );
  }

  /**
   * Check if this version is semantic (not a prerelease)
   */
  isSemantic(): boolean {
    return !this.preRelease;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    const base = `${this.major}.${this.minor}.${this.patch}`;
    return this.preRelease ? `${base}-${this.preRelease}` : base;
  }
}

/**
 * Represents a release/tag in a repository
 */
export class Release {
  constructor(
    public readonly tagName: string,
    public readonly date: Date,
    public readonly version: SemanticVersion | null
  ) {}

  /**
   * Check if this release has a semantic version
   */
  hasSemanticVersion(): boolean {
    return this.version !== null && this.version.isSemantic();
  }

  /**
   * Get days since this release
   */
  getDaysSince(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Statistics about releases in a repository
 */
export class ReleaseStats {
  constructor(
    public readonly totalReleases: number,
    public readonly semanticReleases: number,
    public readonly latestRelease: Release | null,
    public readonly latestSemanticRelease: Release | null,
    public readonly daysSinceLatestRelease: number | null
  ) {}

  /**
   * Check if repository has any releases
   */
  hasReleases(): boolean {
    return this.totalReleases > 0;
  }

  /**
   * Check if repository has semantic releases
   */
  hasSemanticReleases(): boolean {
    return this.semanticReleases > 0;
  }
}
