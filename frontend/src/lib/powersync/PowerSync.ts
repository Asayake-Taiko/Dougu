import { PowerSyncDatabase } from '@powersync/react-native';
import { OPSqliteOpenFactory } from '@powersync/op-sqlite';
import { AppSchema } from './Schema';
import { seedDatabase } from '../mocks/Seeding';

/**
 * Initialize the PowerSync database.
 */
export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: new OPSqliteOpenFactory({
        dbFilename: 'dougu.db',
    }),
});

/**
 * Setup the database, seeding it if in dev mode.
 */
export async function setupDatabase() {
    // Note: ensure process.env.IS_DEV or similar is defined in your build config
    if (__DEV__) {
        try {
            await seedDatabase(db);
        } catch (error) {
            console.error('Error during database setup:', error);
        }
    }
}

/**
 * Completely clear the local PowerSync database.
 * This will disconnect the database and delete the local SQLite file.
 */
export async function clearAllData() {
    await db.disconnectAndClear();
}

