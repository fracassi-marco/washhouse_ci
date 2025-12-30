import { describe, it, expect, beforeAll } from 'vitest';
import { OctokitClient } from '@/infrastructure/adapters/github/OctokitClient';

/**
 * Real integration tests for OctokitClient
 * These tests make actual API calls to GitHub
 * Requires GITHUB_TOKEN environment variable
 */
describe('OctokitClient Real Integration Tests', () => {
  const hasToken = !!process.env.GITHUB_TOKEN;

  beforeAll(() => {
    if (!hasToken) {
      console.warn('⚠️  GITHUB_TOKEN not set. Tests will be skipped.');
      console.warn('   Set GITHUB_TOKEN to run real integration tests.');
    }
  });

  it.skipIf(!hasToken)('should authenticate and fetch rate limit from GitHub API', async () => {
    const client = new OctokitClient();
    
    expect(client.isAuthenticated()).toBe(true);
    
    const rateLimit = await client.getRateLimit();
    
    expect(rateLimit).not.toBeNull();
    expect(rateLimit).toHaveProperty('limit');
    expect(rateLimit).toHaveProperty('remaining');
    expect(rateLimit).toHaveProperty('reset');
    expect(rateLimit!.limit).toBeGreaterThan(0);
    expect(rateLimit!.remaining).toBeGreaterThanOrEqual(0);
    expect(rateLimit!.remaining).toBeLessThanOrEqual(rateLimit!.limit);
  });

  it.skipIf(!hasToken)('should verify authenticated user exists', async () => {
    const client = new OctokitClient();
    const octokit = client.getClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    
    expect(user).toBeDefined();
    expect(user.login).toBeDefined();
    expect(typeof user.login).toBe('string');
    expect(user.login.length).toBeGreaterThan(0);
  });

  it('should handle invalid token gracefully', async () => {
    const invalidClient = new OctokitClient('invalid_token_12345');
    
    const rateLimit = await invalidClient.getRateLimit();
    
    expect(rateLimit).toBeNull();
  });

  it.skipIf(!hasToken)('should return valid Octokit instance with all methods', () => {
    const client = new OctokitClient();
    const octokit = client.getClient();
    
    expect(octokit).toBeDefined();
    expect(octokit.repos).toBeDefined();
    expect(octokit.repos.listForOrg).toBeDefined();
    expect(octokit.rateLimit).toBeDefined();
    expect(octokit.users).toBeDefined();
    expect(typeof octokit.repos.listForOrg).toBe('function');
  });

  it.skipIf(!hasToken)('should consume rate limit on API call', async () => {
    const client = new OctokitClient();
    
    const rateLimitBefore = await client.getRateLimit();
    expect(rateLimitBefore).not.toBeNull();
    
    // Make an API call
    const octokit = client.getClient();
    await octokit.users.getAuthenticated();
    
    const rateLimitAfter = await client.getRateLimit();
    expect(rateLimitAfter).not.toBeNull();
    expect(rateLimitAfter!.remaining).toBeLessThanOrEqual(rateLimitBefore!.remaining);
  });
});
