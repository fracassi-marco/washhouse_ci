import { User } from '@/domain/models/User';

describe('User', () => {
  describe('constructor', () => {
    it('should create a user with valid data', () => {
      const user = new User('123', 'test@example.com', 'Test User');

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should throw error for invalid email', () => {
      expect(() => new User('123', 'invalid-email', 'Test User'))
        .toThrow('Invalid email address');
    });

    it('should throw error for empty email', () => {
      expect(() => new User('123', '', 'Test User'))
        .toThrow('Invalid email address');
    });
  });

  describe('getDomain', () => {
    it('should extract domain from email', () => {
      const user = new User('123', 'test@example.com', 'Test User');

      expect(user.getDomain()).toBe('example.com');
    });

    it('should handle subdomain in email', () => {
      const user = new User('123', 'test@mail.company.com', 'Test User');

      expect(user.getDomain()).toBe('mail.company.com');
    });
  });

  describe('hasAllowedDomain', () => {
    it('should return true for matching domain', () => {
      const user = new User('123', 'test@example.com', 'Test User');

      expect(user.hasAllowedDomain('example.com')).toBe(true);
    });

    it('should return false for non-matching domain', () => {
      const user = new User('123', 'test@example.com', 'Test User');

      expect(user.hasAllowedDomain('other.com')).toBe(false);
    });

    it('should be case sensitive', () => {
      const user = new User('123', 'test@Example.COM', 'Test User');

      expect(user.hasAllowedDomain('Example.COM')).toBe(true);
    });
  });

  describe('getDisplayName', () => {
    it('should return name when available', () => {
      const user = new User('123', 'test@example.com', 'Test User');

      expect(user.getDisplayName()).toBe('Test User');
    });

    it('should return email username when name is not provided', () => {
      const user = new User('123', 'test@example.com');

      expect(user.getDisplayName()).toBe('test');
    });

    it('should return email username when name is empty string', () => {
      const user = new User('123', 'test@example.com', '');

      expect(user.getDisplayName()).toBe('test');
    });
  });
});
