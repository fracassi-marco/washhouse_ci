import { describe, it, expect, beforeAll } from 'vitest';
import { RepositoryMapper } from '@/infrastructure/adapters/github/mappers/RepositoryMapper';
import { Repository } from '@/domain/models/Repository';
import { OctokitClient } from '@/infrastructure/adapters/github/OctokitClient';

/**
 * Real integration tests for RepositoryMapper
 * Tests mapping of actual GitHub API responses to domain models
 */
describe('RepositoryMapper Real Integration Tests', () => {
  const hasToken = !!process.env.GITHUB_TOKEN;
  let client: OctokitClient;

  beforeAll(() => {
    if (!hasToken) {
      console.warn('⚠️  GITHUB_TOKEN not set. Tests will be skipped.');
    } else {
      client = new OctokitClient();
    }
  });

  it.skipIf(!hasToken)('should map real GitHub repository to domain model', async () => {
    const octokit = client.getClient();
    
    // Fetch a well-known public repository
    const { data: githubRepo } = await octokit.repos.get({
      owner: 'vercel',
      repo: 'next.js',
    });

    const domainRepo = RepositoryMapper.toDomain(githubRepo);

    expect(domainRepo).toBeInstanceOf(Repository);
    expect(domainRepo.name).toBe('next.js');
    expect(domainRepo.owner).toBe('vercel');
    expect(domainRepo.url).toBe('https://github.com/vercel/next.js');
    expect(domainRepo.description).toBeDefined();
    expect(domainRepo.language).toBeDefined();
    expect(domainRepo.starCount).toBeGreaterThan(10000); // next.js is very popular
    expect(domainRepo.updatedAt).toBeInstanceOf(Date);
    expect(domainRepo.getFullName()).toBe('vercel/next.js');
  });

  it.skipIf(!hasToken)('should map multiple real repositories correctly', async () => {
    const octokit = client.getClient();
    
    // Fetch multiple repositories
    const { data: githubRepos } = await octokit.repos.listForOrg({
      org: 'vercel',
      per_page: 5,
      sort: 'updated',
    });

    expect(githubRepos.length).toBeGreaterThan(0);

    const domainRepos = RepositoryMapper.toDomainList(githubRepos);

    expect(domainRepos.length).toBe(githubRepos.length);
    
    domainRepos.forEach((repo, index) => {
      expect(repo).toBeInstanceOf(Repository);
      expect(repo.name).toBe(githubRepos[index].name);
      expect(repo.owner).toBe('vercel');
      expect(repo.url).toContain('github.com/vercel');
      expect(repo.starCount).toBeGreaterThanOrEqual(0);
      expect(repo.updatedAt).toBeInstanceOf(Date);
    });
  });

  it.skipIf(!hasToken)('should handle repositories with various data patterns', async () => {
    const octokit = client.getClient();
    
    // Fetch repos that might have different data patterns
    const { data: githubRepos } = await octokit.repos.listForOrg({
      org: 'microsoft',
      per_page: 10,
    });

    const domainRepos = RepositoryMapper.toDomainList(githubRepos);

    domainRepos.forEach(repo => {
      // All repos should have required fields
      expect(repo.name).toBeTruthy();
      expect(repo.owner).toBe('microsoft');
      expect(repo.url).toMatch(/^https:\/\/github\.com\/microsoft\/.+/);
      expect(repo.starCount).toBeGreaterThanOrEqual(0);
      expect(repo.updatedAt).toBeInstanceOf(Date);
      
      // Optional fields can be null
      if (repo.description !== null) {
        expect(typeof repo.description).toBe('string');
      }
      if (repo.language !== null) {
        expect(typeof repo.language).toBe('string');
      }
    });
  });

  it('should handle mock data without API call', () => {
    const mockGithubRepo = {
      name: 'test-repo',
      owner: { login: 'test-owner' },
      html_url: 'https://github.com/test-owner/test-repo',
      description: 'Test description',
      language: 'TypeScript',
      stargazers_count: 42,
      updated_at: '2025-12-30T10:00:00Z',
    };

    const domainRepo = RepositoryMapper.toDomain(mockGithubRepo);

    expect(domainRepo).toBeInstanceOf(Repository);
    expect(domainRepo.name).toBe('test-repo');
    expect(domainRepo.owner).toBe('test-owner');
    expect(domainRepo.starCount).toBe(42);
  });

  it.skipIf(!hasToken)('should correctly parse dates from real API', async () => {
    const octokit = client.getClient();
    
    const { data: githubRepo } = await octokit.repos.get({
      owner: 'facebook',
      repo: 'react',
    });

    const domainRepo = RepositoryMapper.toDomain(githubRepo);

    expect(domainRepo.updatedAt).toBeInstanceOf(Date);
    expect(domainRepo.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    expect(domainRepo.updatedAt.getTime()).toBeGreaterThan(new Date('2010-01-01').getTime());
    
    // React is actively maintained
    expect(domainRepo.getDaysSinceUpdate()).toBeLessThan(365);
  });
});
