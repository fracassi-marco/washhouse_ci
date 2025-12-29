import { Logger } from '@/domain/ports/Logger';

/**
 * Console logger implementation
 * Logs to console with timestamp and formatting
 */
export class ConsoleLogger implements Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  debug(message: string, context?: Record<string, unknown>): void {
    // Suppress debug logs in production
    if (!this.isProduction) {
      console.log(this.format('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.format('INFO', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.format('WARN', message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(this.format('ERROR', message, context));
    if (error) {
      console.error('Error details:', error);
    }
  }

  private format(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` ${JSON.stringify(context)}`;
    }
    
    return formatted;
  }
}
