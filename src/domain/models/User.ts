/**
 * User domain model - represents an authenticated user in the system
 * Pure domain entity with no framework dependencies
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null
  ) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
  }

  /**
   * Validates if email belongs to allowed domain
   * @param allowedDomain - Domain to check against (e.g., 'example.com')
   * @returns true if email matches the domain
   */
  public hasAllowedDomain(allowedDomain: string): boolean {
    return this.email.endsWith(`@${allowedDomain}`);
  }

  /**
   * Gets the domain part of the email
   */
  public getDomain(): string {
    const parts = this.email.split('@');
    return parts.length === 2 ? parts[1] : '';
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Creates a display name for the user
   */
  public getDisplayName(): string {
    return this.name || this.email.split('@')[0];
  }
}
