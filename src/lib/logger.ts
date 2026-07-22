type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  durationMs?: number;
}

class StructuredLogger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...meta,
    };

    const formatted = JSON.stringify(entry);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else if (level === 'debug') {
      console.debug(formatted);
    } else {
      console.log(formatted);
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  timed<T>(label: string, fn: () => T): T {
    const start = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - start;
      this.info(label, { durationMs: duration, status: 'success' });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(label, { durationMs: duration, status: 'error', error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async timedAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(label, { durationMs: duration, status: 'success' });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(label, { durationMs: duration, status: 'error', error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

export const logger = new StructuredLogger('cybershield-academy');
export type { LogEntry, LogLevel };