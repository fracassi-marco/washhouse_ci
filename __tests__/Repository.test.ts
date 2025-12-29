import { Repository } from '@/domain/models/Repository';

describe('Repository', () => {
  describe('constructor', () => {
    it('should create a repository with valid data', () => {
      const updatedAt = new Date('2025-01-01');
      const repo = new Repository(
        'test-repo',
        'test-owner',
        'https://github.com/test-owner/test-repo',
        'Test description',
        'TypeScript',
        42,
        updatedAt
      );

      expect(repo.name).toBe('test-repo');
      expect(repo.owner).toBe('test-owner');
      expect(repo.url).toBe('https://github.com/test-owner/test-repo');
      expect(repo.description).toBe('Test description');
      expect(repo.language).toBe('TypeScript');
      expect(repo.starCount).toBe(42);
      expect(repo.updatedAt).toBe(updatedAt);
    });

    it('should throw error for empty name', () => {
      expect(() => new Repository(
        '',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        new Date()
      )).toThrow('Repository name, owner, and url are required');
    });

    it('should throw error for empty owner', () => {
      expect(() => new Repository(
        'repo',
        '',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        new Date()
      )).toThrow('Repository name, owner, and url are required');
    });

    it('should throw error for negative star count', () => {
      expect(() => new Repository(
        'repo',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        -5,
        new Date()
      )).toThrow('Star count cannot be negative');
    });

    it('should accept null description and language', () => {
      const repo = new Repository(
        'repo',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        new Date()
      );

      expect(repo.description).toBeNull();
      expect(repo.language).toBeNull();
    });
  });

  describe('getFullName', () => {
    it('should return owner/name format', () => {
      const repo = new Repository(
        'test-repo',
        'test-owner',
        'https://github.com/test-owner/test-repo',
        null,
        null,
        0,
        new Date()
      );

      expect(repo.getFullName()).toBe('test-owner/test-repo');
    });
  });

  describe('isRecentlyUpdated', () => {
    it('should return true for recently updated repo (within 30 days)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const repo = new Repository(
        'repo',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        yesterday
      );

      expect(repo.isRecentlyUpdated()).toBe(true);
    });

    it('should return false for old repo (more than 30 days)', () => {
      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);
      
      const repo = new Repository(
        'repo',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        fortyDaysAgo
      );

      expect(repo.isRecentlyUpdated()).toBe(false);
    });

    it('should return false for repo updated exactly 30 days ago', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const repo = new Repository(
        'repo',
        'owner',
        'https://github.com/owner/repo',
        null,
        null,
        0,
        thirtyDaysAgo
      );

      expect(repo.isRecentlyUpdated()).toBe(false);
    });
  });
});
