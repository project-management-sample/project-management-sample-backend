/**
 * 構造化ロガー実装
 *
 * JSON形式でログを出力し、timestamp/level/message/contextを統一して記録する
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, context?: unknown): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context !== undefined ? { context } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, context?: unknown) => log('debug', message, context),
  info:  (message: string, context?: unknown) => log('info',  message, context),
  warn:  (message: string, context?: unknown) => log('warn',  message, context),
  error: (message: string, context?: unknown) => log('error', message, context),
};
