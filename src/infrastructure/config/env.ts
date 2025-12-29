/**
 * Environment configuration
 * Validates and provides access to environment variables
 */
export class EnvironmentConfig {
  /**
   * Feature flag: Enable/disable authentication
   * Default: false (authentication disabled for development)
   */
  static get AUTH_ENABLED(): boolean {
    return process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
  }

  // Google OAuth Configuration
  static get GOOGLE_CLIENT_ID(): string {
    return process.env.GOOGLE_CLIENT_ID || '';
  }

  static get GOOGLE_CLIENT_SECRET(): string {
    return process.env.GOOGLE_CLIENT_SECRET || '';
  }

  // NextAuth Configuration
  static get NEXTAUTH_URL(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }

  static get NEXTAUTH_SECRET(): string {
    return process.env.NEXTAUTH_SECRET || '';
  }

  // GitHub Configuration (for future features)
  static get GITHUB_TOKEN(): string {
    return process.env.GITHUB_TOKEN || '';
  }

  static get GITHUB_ORG(): string {
    return process.env.GITHUB_ORG || '';
  }

  static get WORKFLOW_NAME(): string {
    return process.env.WORKFLOW_NAME || 'Build and Push to ECR';
  }

  /**
   * Validates required environment variables based on features enabled
   * @throws Error if required variables are missing
   */
  static validate(): void {
    const errors: string[] = [];

    // Only validate auth vars if auth is enabled
    if (this.AUTH_ENABLED) {
      if (!this.GOOGLE_CLIENT_ID) {
        errors.push('GOOGLE_CLIENT_ID is required when AUTH_ENABLED=true');
      }
      if (!this.GOOGLE_CLIENT_SECRET) {
        errors.push('GOOGLE_CLIENT_SECRET is required when AUTH_ENABLED=true');
      }
      if (!this.NEXTAUTH_SECRET) {
        errors.push('NEXTAUTH_SECRET is required when AUTH_ENABLED=true');
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Environment validation failed:\n${errors.join('\n')}`
      );
    }
  }

  /**
   * Gets a summary of current configuration (for debugging)
   */
  static getSummary(): Record<string, string | boolean> {
    return {
      AUTH_ENABLED: this.AUTH_ENABLED,
      NEXTAUTH_URL: this.NEXTAUTH_URL,
      ALLOWED_EMAIL_DOMAIN: this.ALLOWED_EMAIL_DOMAIN,
      GITHUB_ORG: this.GITHUB_ORG,
      WORKFLOW_NAME: this.WORKFLOW_NAME,
      // Don't expose secrets
      HAS_GOOGLE_CLIENT_ID: !!this.GOOGLE_CLIENT_ID,
      HAS_GOOGLE_CLIENT_SECRET: !!this.GOOGLE_CLIENT_SECRET,
      HAS_NEXTAUTH_SECRET: !!this.NEXTAUTH_SECRET,
      HAS_GITHUB_TOKEN: !!this.GITHUB_TOKEN,
    };
  }
}
