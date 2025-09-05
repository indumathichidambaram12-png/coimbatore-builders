import { migrateDataToFirestore } from './migrateToFirestore';

async function runMigration() {
  try {
    await migrateDataToFirestore();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
