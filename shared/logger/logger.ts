type LogLevel = 'info' | 'warn' | 'error';

type LogContext = {
    context?: unknown;
    error?: unknown;
};

function write(level: LogLevel, message: string, payload?: LogContext) {
    const loggerPayload = {
        level,
        message,
        context: payload?.context,
        error: payload?.error,
        timestamp: new Date().toISOString(),
    };

    console[level](loggerPayload);
}

export const logger = {
    info(message: string, context?: unknown) {
        write('info', message, { context });
    },
    warn(message: string, context?: unknown) {
        write('warn', message, { context });
    },
    error(message: string, payload?: LogContext) {
        write('error', message, payload);
    },
};
