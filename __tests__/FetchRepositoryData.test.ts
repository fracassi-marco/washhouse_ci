import { mock, instance, when, verify, anything } from 'ts-mockito';
import { FetchRepositoryData } from '@/usecase/FetchRepositoryData';
import { RepositoryProvider, RepositoryTag } from '@/domain/ports/RepositoryProvider';
import { Logger } from '@/domain/ports/Logger';
import { Repository } from '@/domain/models/Repository';

describe('FetchRepositoryData', () => {
  let mockRepositoryProvider: RepositoryProvider;
  let mockLogger: Logger;
  let fetchRepositoryData: FetchRepositoryData;

  beforeEach(() => {
    mockRepositoryProvider = mock<RepositoryProvider>();
    mockLogger = mock<Logger>();
    
    fetchRepositoryData = new FetchRepositoryData(
      instance(mockRepositoryProvider),
      instance(mockLogger)
    );
  });

  describe('execute', () => {
    it('should enrich repository with release stats', async () => {
      const repository = new Repository(
        'test-repo',
        'test-org',
        'https://github.com/test-org/test-repo',
        'Test description',
        'TypeScript',
        10,
        new Date()
      );

      const tags: RepositoryTag[] = [
        { name: 'v2.0.0', date: new Date('2024-03-01') },
        { name: 'v1.0.0', date: new Date('2024-01-01') },
      ];

      when(mockRepositoryProvider.getRepositoryTags('test-org', 'test-repo'))
        .thenResolve(tags);

      const result = await fetchRepositoryData.execute(repository);

      expect(result.name).toBe('test-repo');
      expect(result.owner).toBe('test-org');
      expect(result.releaseStats).not.toBeNull();
      expect(result.releaseStats!.totalReleases).toBe(2);
      expect(result.releaseStats!.semanticReleases).toBe(2);
      verify(mockRepositoryProvider.getRepositoryTags('test-org', 'test-repo')).once();
    });

    it('should handle repository with no tags', async () => {
      const repository = new Repository(
        'no-releases',
        'test-org',
        'https://github.com/test-org/no-releases',
        null,
        null,
        0,
        new Date()
      );

      when(mockRepositoryProvider.getRepositoryTags('test-org', 'no-releases'))
        .thenResolve([]);

      const result = await fetchRepositoryData.execute(repository);

      expect(result.releaseStats).not.toBeNull();
      expect(result.releaseStats!.totalReleases).toBe(0);
      expect(result.releaseStats!.hasReleases()).toBe(false);
    });

    it('should return original repository on error', async () => {
      const repository = new Repository(
        'error-repo',
        'test-org',
        'https://github.com/test-org/error-repo',
        null,
        null,
        0,
        new Date()
      );

      when(mockRepositoryProvider.getRepositoryTags('test-org', 'error-repo'))
        .thenReject(new Error('API error'));

      const result = await fetchRepositoryData.execute(repository);

      // Should return original repository without release stats
      expect(result.name).toBe('error-repo');
      expect(result.releaseStats).toBeNull();
    });

    it('should filter semantic versions correctly', async () => {
      const repository = new Repository(
        'mixed-tags',
        'test-org',
        'https://github.com/test-org/mixed-tags',
        null,
        null,
        0,
        new Date()
      );

      const tags: RepositoryTag[] = [
        { name: 'v2.0.0', date: new Date('2024-03-01') },
        { name: 'v1.5.0-beta', date: new Date('2024-02-15') },
        { name: 'v1.0.0', date: new Date('2024-01-01') },
        { name: 'random-tag', date: new Date('2023-12-01') },
      ];

      when(mockRepositoryProvider.getRepositoryTags('test-org', 'mixed-tags'))
        .thenResolve(tags);

      const result = await fetchRepositoryData.execute(repository);

      expect(result.releaseStats!.totalReleases).toBe(4);
      expect(result.releaseStats!.semanticReleases).toBe(2); // Only v2.0.0 and v1.0.0
      expect(result.releaseStats!.latestSemanticRelease?.tagName).toBe('v2.0.0');
    });

    it('should preserve all repository properties', async () => {
      const repository = new Repository(
        'preserve-test',
        'test-org',
        'https://github.com/test-org/preserve-test',
        'Important description',
        'JavaScript',
        100,
        new Date('2024-06-01')
      );

      when(mockRepositoryProvider.getRepositoryTags('test-org', 'preserve-test'))
        .thenResolve([{ name: 'v1.0.0', date: new Date() }]);

      const result = await fetchRepositoryData.execute(repository);

      expect(result.name).toBe('preserve-test');
      expect(result.owner).toBe('test-org');
      expect(result.url).toBe('https://github.com/test-org/preserve-test');
      expect(result.description).toBe('Important description');
      expect(result.language).toBe('JavaScript');
      expect(result.starCount).toBe(100);
      expect(result.updatedAt).toEqual(new Date('2024-06-01'));
    });
  });
});
