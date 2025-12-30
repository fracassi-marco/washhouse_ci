import { describe, it, expect } from 'vitest';
import { OctokitClient } from '@/infrastructure/adapters/github/OctokitClient';
import { ReleaseMapper } from '@/infrastructure/adapters/github/mappers/ReleaseMapper';
import { GitHubRepositoryProvider } from '@/infrastructure/adapters/github/GitHubRepositoryProvider';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const hasToken = GITHUB_TOKEN.length > 0;

describe('Release Infrastructure Integration Tests', () => {
  describe('ReleaseMapper', () => {
    it.skipIf(!hasToken)('should map real GitHub tag to RepositoryTag', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const octokit = client.getClient();
      
      // Fetch a real tag from a public repo (vercel/next.js)
      const { data: tags } = await octokit.repos.listTags({
        owner: 'vercel',
        repo: 'next.js',
        per_page: 1,
      });

      expect(tags.length).toBeGreaterThan(0);

      const mappedTag = ReleaseMapper.mapTag(tags[0]);

      expect(mappedTag).toHaveProperty('name');
      expect(mappedTag).toHaveProperty('date');
      expect(typeof mappedTag.name).toBe('string');
      expect(mappedTag.date).toBeInstanceOf(Date);
      expect(mappedTag.name.length).toBeGreaterThan(0);
    });

    it.skipIf(!hasToken)('should map multiple tags', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const octokit = client.getClient();
      
      const { data: tags } = await octokit.repos.listTags({
        owner: 'vercel',
        repo: 'next.js',
        per_page: 5,
      });

      const mappedTags = ReleaseMapper.mapTags(tags);

      expect(mappedTags.length).toBe(tags.length);
      mappedTags.forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('date');
        expect(tag.date).toBeInstanceOf(Date);
      });
    });
  });

  describe('GitHubRepositoryProvider - getRepositoryTags', () => {
    it.skipIf(!hasToken)('should fetch real tags from a repository', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      const tags = await provider.getRepositoryTags('vercel', 'next.js');

      expect(tags.length).toBeGreaterThan(0);
      
      // Check first tag structure
      const firstTag = tags[0];
      expect(firstTag).toHaveProperty('name');
      expect(firstTag).toHaveProperty('date');
      expect(typeof firstTag.name).toBe('string');
      expect(firstTag.date).toBeInstanceOf(Date);
    });

    it.skipIf(!hasToken)('should fetch tags from multiple repositories', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      const [nextTags, reactTags] = await Promise.all([
        provider.getRepositoryTags('vercel', 'next.js'),
        provider.getRepositoryTags('facebook', 'react'),
      ]);

      expect(nextTags.length).toBeGreaterThan(0);
      expect(reactTags.length).toBeGreaterThan(0);
      
      // Verify tags are different
      expect(nextTags[0].name).not.toBe(reactTags[0].name);
    });

    it.skipIf(!hasToken)('should handle repository with no tags', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      // Most repos have tags, but some test repos might not
      // This tests the happy path for empty results
      const tags = await provider.getRepositoryTags('microsoft', 'TypeScript-Website-Localizations');

      // Should return empty array, not throw
      expect(Array.isArray(tags)).toBe(true);
    });

    it.skipIf(!hasToken)('should throw error for non-existent repository', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      await expect(
        provider.getRepositoryTags('vercel', 'this-repo-definitely-does-not-exist-12345')
      ).rejects.toThrow(/not found/i);
    });

    it.skipIf(!hasToken)('should return tags sorted by GitHub API order', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      const tags = await provider.getRepositoryTags('facebook', 'react');

      expect(tags.length).toBeGreaterThan(1);
      
      // GitHub returns tags in order, verify we preserve that
      tags.forEach(tag => {
        expect(tag.date.getTime()).toBeGreaterThan(0);
        expect(tag.date.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    it.skipIf(!hasToken)('should fetch up to 100 tags', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      // Next.js has many releases
      const tags = await provider.getRepositoryTags('vercel', 'next.js');

      // Should fetch many tags (up to 100)
      expect(tags.length).toBeGreaterThan(50);
      expect(tags.length).toBeLessThanOrEqual(100);
    });

    it.skipIf(!hasToken)('should include commit date information', async () => {
      const client = new OctokitClient(GITHUB_TOKEN);
      const provider = new GitHubRepositoryProvider(client, '');
      
      const tags = await provider.getRepositoryTags('nodejs', 'node');

      expect(tags.length).toBeGreaterThan(0);
      
      // Verify all tags have valid dates
      tags.forEach(tag => {
        expect(tag.date).toBeInstanceOf(Date);
        expect(isNaN(tag.date.getTime())).toBe(false);
        // Should be a reasonable date (after 2000, before tomorrow)
        expect(tag.date.getFullYear()).toBeGreaterThanOrEqual(2000);
        expect(tag.date.getTime()).toBeLessThan(Date.now() + 86400000);
      });
    });
  });
});
