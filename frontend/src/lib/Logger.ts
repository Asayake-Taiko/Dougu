/**
 * Logger utility to handle application logging.
 * Logs are output only when the application is running in development mode (__DEV__ is true)
 * or when mocking is enabled (MOCK_ENABLED is true).
 */
import { MOCK_ENABLED } from './env';
export const Logger = {
    /**
     * Log standard info messages
     */
    info: (...args: any[]) => {
        if (__DEV__ || MOCK_ENABLED) {
            console.log(...args);
        }
    },

    /**
     * Log warning messages
     */
    warn: (...args: any[]) => {
        if (__DEV__ || MOCK_ENABLED) {
            console.warn(...args);
        }
    },

    /**
     * Log error messages
     */
    error: (...args: any[]) => {
        if (__DEV__ || MOCK_ENABLED) {
            console.error(...args);
        }
    },

    /**
     * Log debug messages (alias for log/info)
     */
    debug: (...args: any[]) => {
        if (__DEV__ || MOCK_ENABLED) {
            console.debug(...args);
        }
    },
};
