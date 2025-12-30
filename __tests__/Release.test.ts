import { Release, SemanticVersion, ReleaseStats } from '@/domain/models/Release';
import { ReleaseCalculator } from '@/domain/services/ReleaseCalculator';

describe('Release Domain Model', () => {
  describe('SemanticVersion', () => {
    it('should parse valid semantic version', () => {
      const version = SemanticVersion.parse('v1.2.3');
      
      expect(version).not.toBeNull();
      expect(version!.major).toBe(1);
      expect(version!.minor).toBe(2);
      expect(version!.patch).toBe(3);
      expect(version!.preRelease).toBeUndefined();
    });

    it('should parse version without v prefix', () => {
      const version = SemanticVersion.parse('2.0.1');
      
      expect(version).not.toBeNull();
      expect(version!.major).toBe(2);
      expect(version!.minor).toBe(0);
      expect(version!.patch).toBe(1);
    });

    it('should parse version with prerelease', () => {
      const version = SemanticVersion.parse('1.0.0-beta.1');
      
      expect(version).not.toBeNull();
      expect(version!.major).toBe(1);
      expect(version!.minor).toBe(0);
      expect(version!.patch).toBe(0);
      expect(version!.preRelease).toBe('beta.1');
    });

    it('should return null for invalid versions', () => {
      expect(SemanticVersion.parse('invalid')).toBeNull();
      expect(SemanticVersion.parse('1.2')).toBeNull();
      expect(SemanticVersion.parse('v1')).toBeNull();
      expect(SemanticVersion.parse('abc.def.ghi')).toBeNull();
    });

    it('should check if version is semantic', () => {
      const semantic = SemanticVersion.parse('1.2.3')!;
      const prerelease = SemanticVersion.parse('1.2.3-beta')!;
      
      expect(semantic.isSemantic()).toBe(true);
      expect(prerelease.isSemantic()).toBe(false);
    });

    it('should convert to string', () => {
      const semantic = SemanticVersion.parse('1.2.3')!;
      const prerelease = SemanticVersion.parse('1.2.3-beta')!;
      
      expect(semantic.toString()).toBe('1.2.3');
      expect(prerelease.toString()).toBe('1.2.3-beta');
    });
  });

  describe('Release', () => {
    it('should create release with semantic version', () => {
      const version = SemanticVersion.parse('1.0.0')!;
      const date = new Date('2024-01-01');
      const release = new Release('v1.0.0', date, version);
      
      expect(release.tagName).toBe('v1.0.0');
      expect(release.date).toEqual(date);
      expect(release.version).toEqual(version);
    });

    it('should create release without semantic version', () => {
      const date = new Date('2024-01-01');
      const release = new Release('some-tag', date, null);
      
      expect(release.tagName).toBe('some-tag');
      expect(release.version).toBeNull();
    });

    it('should check if has semantic version', () => {
      const withSemantic = new Release(
        'v1.0.0',
        new Date(),
        SemanticVersion.parse('1.0.0')!
      );
      const withPrerelease = new Release(
        'v1.0.0-beta',
        new Date(),
        SemanticVersion.parse('1.0.0-beta')!
      );
      const withoutSemantic = new Release('tag', new Date(), null);
      
      expect(withSemantic.hasSemanticVersion()).toBe(true);
      expect(withPrerelease.hasSemanticVersion()).toBe(false);
      expect(withoutSemantic.hasSemanticVersion()).toBe(false);
    });

    it('should calculate days since release', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const release = new Release('v1.0.0', threeDaysAgo, null);
      
      expect(release.getDaysSince()).toBe(3);
    });
  });

  describe('ReleaseStats', () => {
    it('should create stats with releases', () => {
      const release = new Release('v1.0.0', new Date(), SemanticVersion.parse('1.0.0')!);
      const stats = new ReleaseStats(5, 3, release, release, 10);
      
      expect(stats.totalReleases).toBe(5);
      expect(stats.semanticReleases).toBe(3);
      expect(stats.latestRelease).toEqual(release);
      expect(stats.latestSemanticRelease).toEqual(release);
      expect(stats.daysSinceLatestRelease).toBe(10);
    });

    it('should create empty stats', () => {
      const stats = new ReleaseStats(0, 0, null, null, null);
      
      expect(stats.hasReleases()).toBe(false);
      expect(stats.hasSemanticReleases()).toBe(false);
    });

    it('should check if has releases', () => {
      const withReleases = new ReleaseStats(3, 2, null, null, 0);
      const withoutReleases = new ReleaseStats(0, 0, null, null, null);
      
      expect(withReleases.hasReleases()).toBe(true);
      expect(withoutReleases.hasReleases()).toBe(false);
    });

    it('should check if has semantic releases', () => {
      const withSemantic = new ReleaseStats(5, 3, null, null, 0);
      const withoutSemantic = new ReleaseStats(5, 0, null, null, 0);
      
      expect(withSemantic.hasSemanticReleases()).toBe(true);
      expect(withoutSemantic.hasSemanticReleases()).toBe(false);
    });
  });
});

describe('ReleaseCalculator Service', () => {
  describe('calculateStats', () => {
    it('should calculate stats for empty releases', () => {
      const stats = ReleaseCalculator.calculateStats([]);
      
      expect(stats.totalReleases).toBe(0);
      expect(stats.semanticReleases).toBe(0);
      expect(stats.latestRelease).toBeNull();
      expect(stats.latestSemanticRelease).toBeNull();
      expect(stats.daysSinceLatestRelease).toBeNull();
    });

    it('should calculate stats for releases', () => {
      const releases = [
        new Release('v2.0.0', new Date('2024-03-01'), SemanticVersion.parse('2.0.0')!),
        new Release('v1.5.0-beta', new Date('2024-02-01'), SemanticVersion.parse('1.5.0-beta')!),
        new Release('v1.0.0', new Date('2024-01-01'), SemanticVersion.parse('1.0.0')!),
      ];
      
      const stats = ReleaseCalculator.calculateStats(releases);
      
      expect(stats.totalReleases).toBe(3);
      expect(stats.semanticReleases).toBe(2); // v2.0.0 and v1.0.0
      expect(stats.latestRelease?.tagName).toBe('v2.0.0');
      expect(stats.latestSemanticRelease?.tagName).toBe('v2.0.0');
      expect(stats.daysSinceLatestRelease).toBeGreaterThanOrEqual(0);
    });

    it('should handle releases without semantic versions', () => {
      const releases = [
        new Release('some-tag', new Date(), null),
        new Release('another-tag', new Date(), null),
      ];
      
      const stats = ReleaseCalculator.calculateStats(releases);
      
      expect(stats.totalReleases).toBe(2);
      expect(stats.semanticReleases).toBe(0);
      expect(stats.latestSemanticRelease).toBeNull();
    });
  });

  describe('filterSemanticVersions', () => {
    it('should filter only semantic versions', () => {
      const releases = [
        new Release('v2.0.0', new Date(), SemanticVersion.parse('2.0.0')!),
        new Release('some-tag', new Date(), null),
        new Release('v1.0.0-beta', new Date(), SemanticVersion.parse('1.0.0-beta')!),
        new Release('v1.0.0', new Date(), SemanticVersion.parse('1.0.0')!),
      ];
      
      const semantic = ReleaseCalculator.filterSemanticVersions(releases);
      
      expect(semantic).toHaveLength(2);
      expect(semantic[0].tagName).toBe('v2.0.0');
      expect(semantic[1].tagName).toBe('v1.0.0');
    });
  });

  describe('calculateDaysSince', () => {
    it('should calculate days since date', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      const days = ReleaseCalculator.calculateDaysSince(fiveDaysAgo);
      
      expect(days).toBe(5);
    });

    it('should handle today', () => {
      const today = new Date();
      const days = ReleaseCalculator.calculateDaysSince(today);
      
      expect(days).toBe(0);
    });
  });

  describe('parseTags', () => {
    it('should parse tags into releases', () => {
      const tags = [
        { name: 'v1.0.0', date: new Date('2024-01-01') },
        { name: 'v2.0.0', date: new Date('2024-03-01') },
        { name: 'some-tag', date: new Date('2024-02-01') },
      ];
      
      const releases = ReleaseCalculator.parseTags(tags);
      
      expect(releases).toHaveLength(3);
      expect(releases[0].tagName).toBe('v2.0.0'); // Sorted by date descending
      expect(releases[1].tagName).toBe('some-tag');
      expect(releases[2].tagName).toBe('v1.0.0');
    });

    it('should sort by date descending', () => {
      const tags = [
        { name: 'v1.0.0', date: new Date('2024-01-01') },
        { name: 'v3.0.0', date: new Date('2024-05-01') },
        { name: 'v2.0.0', date: new Date('2024-03-01') },
      ];
      
      const releases = ReleaseCalculator.parseTags(tags);
      
      expect(releases[0].tagName).toBe('v3.0.0');
      expect(releases[1].tagName).toBe('v2.0.0');
      expect(releases[2].tagName).toBe('v1.0.0');
    });
  });

  describe('getLatestReleases', () => {
    it('should get latest N releases', () => {
      const releases = [
        new Release('v3.0.0', new Date('2024-03-01'), SemanticVersion.parse('3.0.0')!),
        new Release('v2.0.0', new Date('2024-02-01'), SemanticVersion.parse('2.0.0')!),
        new Release('v1.0.0', new Date('2024-01-01'), SemanticVersion.parse('1.0.0')!),
      ];
      
      const latest = ReleaseCalculator.getLatestReleases(releases, 2);
      
      expect(latest).toHaveLength(2);
      expect(latest[0].tagName).toBe('v3.0.0');
      expect(latest[1].tagName).toBe('v2.0.0');
    });
  });

  describe('isRecentRelease', () => {
    it('should check if release is recent', () => {
      const recent = new Release('v1.0.0', new Date(), SemanticVersion.parse('1.0.0')!);
      
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const old = new Release('v0.9.0', tenDaysAgo, SemanticVersion.parse('0.9.0')!);
      
      expect(ReleaseCalculator.isRecentRelease(recent, 7)).toBe(true);
      expect(ReleaseCalculator.isRecentRelease(old, 7)).toBe(false);
      expect(ReleaseCalculator.isRecentRelease(old, 15)).toBe(true);
    });
  });
});
