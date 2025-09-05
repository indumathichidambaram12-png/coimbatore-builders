import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { DatabaseService } from './DatabaseService';

export async function migrateDataToFirestore() {
  const sqliteDb = DatabaseService.getInstance();
  await sqliteDb.init();

  try {
    // Migrate Projects
    const projects = await sqliteDb.getProjects();
    console.log(`Migrating ${projects.length} projects...`);
    
    for (const project of projects) {
      const { id, ...projectData } = project;
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    console.log('✅ Projects migrated successfully');

    // Migrate Workers
    const workers = await sqliteDb.getWorkers();
    console.log(`Migrating ${workers.length} workers...`);
    
    for (const worker of workers) {
      const { id, project_name, ...workerData } = worker;
      await addDoc(collection(db, 'workers'), {
        ...workerData,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    console.log('✅ Workers migrated successfully');

    // Migrate Attendance Records
    const attendance = await sqliteDb.query('SELECT * FROM attendance WHERE is_active = 1');
    console.log(`Migrating ${attendance.length} attendance records...`);
    
    for (const record of attendance) {
      await addDoc(collection(db, 'attendance'), {
        ...record,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    console.log('✅ Attendance records migrated successfully');

    // Migrate Payments
    const payments = await sqliteDb.query('SELECT * FROM payments WHERE is_active = 1');
    console.log(`Migrating ${payments.length} payment records...`);
    
    for (const payment of payments) {
      await addDoc(collection(db, 'payments'), {
        ...payment,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    console.log('✅ Payment records migrated successfully');

    console.log('🎉 All data migrated successfully to Firestore!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}
