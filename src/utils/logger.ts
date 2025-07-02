export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enabled: true,
    };
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setDebugMode(enabled: boolean): void {
    if (enabled) {
      this.config.level = LogLevel.DEBUG;
    }
    this.config.enabled = enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level <= this.config.level;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }
}

export const logger = new Logger();

export function setDebugMode(enabled: boolean): void {
  logger.setDebugMode(enabled);
}
