/**
 * Logger port (interface)
 * Defines the contract for logging operations
 * Implementations will be in the infrastructure layer
 */
export interface Logger {
  /**
   * Log debug information (verbose)
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log informational messages
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log warning messages
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log error messages
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}
