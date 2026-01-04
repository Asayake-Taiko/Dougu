/**
 * Environment variables and configuration.
 */

// Toggle for mock data and seeding
// Set to 'true' to enable mocking even in production/preview builds
export const MOCK_ENABLED = process.env.EXPO_PUBLIC_MOCK_ENABLED === 'true';

// Note: We keep OR __DEV__ for convenience, but the user can now specifically 
// control it via MOCK_ENABLED.
