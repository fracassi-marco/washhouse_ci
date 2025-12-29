import { mock, instance, when, verify } from 'ts-mockito';
import { FetchRepositories } from '@/usecase/FetchRepositories';
import { RepositoryProvider } from '@/domain/ports/RepositoryProvider';
import { Logger } from '@/domain/ports/Logger';
import { Repository } from '@/domain/models/Repository';

describe('FetchRepositories', () => {
  let mockRepositoryProvider: RepositoryProvider;
  let mockLogger: Logger;
  let fetchRepositories: FetchRepositories;

  beforeEach(() => {
    mockRepositoryProvider = mock<RepositoryProvider>();
    mockLogger = mock<Logger>();
    
    fetchRepositories = new FetchRepositories(
      instance(mockRepositoryProvider),
      instance(mockLogger)
    );
  });

  describe('execute', () => {
    it('should fetch repositories from provider', async () => {
      const orgName = 'test-org';
      const mockRepos = [
        new Repository(
          'repo1',
          'test-org',
          'https://github.com/test-org/repo1',
          'Description 1',
          'TypeScript',
          10,
          new Date()
        ),
        new Repository(
          'repo2',
          'test-org',
          'https://github.com/test-org/repo2',
          'Description 2',
          'JavaScript',
          5,
          new Date()
        ),
      ];

      when(mockRepositoryProvider.listRepositories(orgName)).thenResolve(mockRepos);

      const result = await fetchRepositories.execute(orgName);

      expect(result).toEqual(mockRepos);
      expect(result).toHaveLength(2);
      verify(mockRepositoryProvider.listRepositories(orgName)).once();
    });

    it('should handle empty repository list', async () => {
      const orgName = 'empty-org';
      when(mockRepositoryProvider.listRepositories(orgName)).thenResolve([]);

      const result = await fetchRepositories.execute(orgName);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should log and rethrow errors', async () => {
      const orgName = 'error-org';
      const error = new Error('GitHub API error');

      when(mockRepositoryProvider.listRepositories(orgName)).thenReject(error);

      await expect(fetchRepositories.execute(orgName))
        .rejects.toThrow('GitHub API error');
    });

    it('should pass organization name to provider', async () => {
      const orgName = 'specific-org';
      when(mockRepositoryProvider.listRepositories(orgName)).thenResolve([]);

      await fetchRepositories.execute(orgName);

      verify(mockRepositoryProvider.listRepositories('specific-org')).once();
    });
  });
});
