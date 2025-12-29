/**
 * Logger utility to handle application logging.
 * Logs are output only when the application is running in development mode (__DEV__ is true).
 * This prevents sensitive or noisy logs from appearing in production builds.
 */
export const Logger = {
    /**
     * Log standard info messages
     */
    info: (...args: any[]) => {
        if (__DEV__) {
            console.log(...args);
        }
    },

    /**
     * Log warning messages
     */
    warn: (...args: any[]) => {
        if (__DEV__) {
            console.warn(...args);
        }
    },

    /**
     * Log error messages
     */
    error: (...args: any[]) => {
        if (__DEV__) {
            console.error(...args);
        }
    },

    /**
     * Log debug messages (alias for log/info)
     */
    debug: (...args: any[]) => {
        if (__DEV__) {
            console.debug(...args);
        }
    },
};
