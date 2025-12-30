import { describe, it, expect, beforeAll } from 'vitest';
import { GitHubRepositoryProvider } from '@/infrastructure/adapters/github/GitHubRepositoryProvider';
import { OctokitClient } from '@/infrastructure/adapters/github/OctokitClient';
import { Repository } from '@/domain/models/Repository';

/**
 * Real integration tests for GitHubRepositoryProvider
 * Tests the complete flow from GitHub API to domain models
 * Requires GITHUB_TOKEN environment variable
 */
describe('GitHubRepositoryProvider Real Integration Tests', () => {
  const hasToken = !!process.env.GITHUB_TOKEN;
  let provider: GitHubRepositoryProvider;
  let client: OctokitClient;

  beforeAll(() => {
    if (!hasToken) {
      console.warn('⚠️  GITHUB_TOKEN not set. Tests will be skipped.');
    } else {
      client = new OctokitClient();
      provider = new GitHubRepositoryProvider(client, 'vercel');
    }
  });

  it.skipIf(!hasToken)('should fetch real repositories from GitHub API', async () => {
    const repos = await provider.listRepositories();

    expect(repos).toBeDefined();
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(0);

    repos.forEach(repo => {
      expect(repo).toBeInstanceOf(Repository);
      expect(repo.owner).toBe('vercel');
      expect(repo.name).toBeTruthy();
      expect(repo.url).toContain('github.com/vercel');
      expect(repo.starCount).toBeGreaterThanOrEqual(0);
      expect(repo.updatedAt).toBeInstanceOf(Date);
    });
  });

  it.skipIf(!hasToken)('should fetch repositories for different organizations', async () => {
    const microsoftRepos = await provider.listRepositories('microsoft');

    expect(microsoftRepos.length).toBeGreaterThan(0);

    microsoftRepos.forEach(repo => {
      expect(repo.owner).toBe('microsoft');
      expect(repo.url).toContain('github.com/microsoft');
    });

    // Verify we got different repos
    const vercelRepos = await provider.listRepositories('vercel');
    expect(vercelRepos[0].owner).toBe('vercel');
    expect(vercelRepos[0].name).not.toBe(microsoftRepos[0].name);
  });

  it.skipIf(!hasToken)('should return repositories sorted by update date', async () => {
    const repos = await provider.listRepositories();

    // GitHub API returns sorted by 'updated', verify dates are descending
    for (let i = 0; i < repos.length - 1 && i < 10; i++) {
      const current = repos[i].updatedAt.getTime();
      const next = repos[i + 1].updatedAt.getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it.skipIf(!hasToken)('should handle organization with many repositories', async () => {
    // Test with an org known to have many repos
    const repos = await provider.listRepositories('facebook');

    expect(repos.length).toBeGreaterThan(0);
    expect(repos.length).toBeLessThanOrEqual(100); // per_page limit

    repos.forEach(repo => {
      expect(repo).toBeInstanceOf(Repository);
      expect(repo.owner).toBe('facebook');
    });
  });

  it.skipIf(!hasToken)('should throw error for non-existent organization', async () => {
    const nonExistentOrg = 'this-org-definitely-does-not-exist-xyz-12345';

    await expect(provider.listRepositories(nonExistentOrg))
      .rejects
      .toThrow(/not found/i);
  });

  it('should throw error when organization name is not provided', async () => {
    if (!hasToken) return;
    
    const providerWithoutOrg = new GitHubRepositoryProvider(client, '');

    await expect(providerWithoutOrg.listRepositories())
      .rejects
      .toThrow('Organization name is required');
  });

  it.skipIf(!hasToken)('should map all repository properties correctly from real API', async () => {
    const repos = await provider.listRepositories('nodejs');

    expect(repos.length).toBeGreaterThan(0);

    const repo = repos[0];

    // Verify all domain model properties are correctly mapped
    expect(typeof repo.name).toBe('string');
    expect(repo.name.length).toBeGreaterThan(0);
    expect(repo.owner).toBe('nodejs');
    expect(repo.url).toMatch(/^https:\/\/github\.com\/nodejs\/.+/);
    expect(typeof repo.starCount).toBe('number');
    expect(repo.starCount).toBeGreaterThanOrEqual(0);
    expect(repo.updatedAt).toBeInstanceOf(Date);
    expect(repo.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());

    // Test domain model methods work correctly
    expect(repo.getFullName()).toBe(`nodejs/${repo.name}`);
    expect(typeof repo.isRecentlyUpdated()).toBe('boolean');
    expect(typeof repo.getDaysSinceUpdate()).toBe('number');
    expect(repo.getDaysSinceUpdate()).toBeGreaterThanOrEqual(0);
  });

  it.skipIf(!hasToken)('should handle authentication errors appropriately', async () => {
    const invalidClient = new OctokitClient('invalid_token_abc123');
    const invalidProvider = new GitHubRepositoryProvider(invalidClient, 'vercel');

    await expect(invalidProvider.listRepositories())
      .rejects
      .toThrow();
  });

  it.skipIf(!hasToken)('should fetch complete and valid data for popular repositories', async () => {
    const repos = await provider.listRepositories('vercel');

    // Filter popular repos
    const popularRepos = repos.filter(r => r.starCount > 100);
    expect(popularRepos.length).toBeGreaterThan(0);

    popularRepos.forEach(repo => {
      expect(repo.starCount).toBeGreaterThan(100);
      expect(repo.name).toBeTruthy();
      expect(repo.url).toBeTruthy();
      
      // Popular repos usually have descriptions and languages
      // But we don't enforce it since they can be null
      expect(repo.hasDescription() || repo.description === null).toBe(true);
      expect(repo.hasLanguage() || repo.language === null).toBe(true);
    });
  });

  it.skipIf(!hasToken)('should maintain data consistency across multiple calls', async () => {
    const repos1 = await provider.listRepositories('vercel');
    const repos2 = await provider.listRepositories('vercel');

    expect(repos1.length).toBe(repos2.length);

    // Compare first few repos (they should be the same since sorted by update)
    const compareCount = Math.min(3, repos1.length);
    for (let i = 0; i < compareCount; i++) {
      expect(repos1[i].name).toBe(repos2[i].name);
      expect(repos1[i].owner).toBe(repos2[i].owner);
      expect(repos1[i].url).toBe(repos2[i].url);
    }
  });
});
