import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function initializeFirestore() {
  try {
    // Create initial collections
    await setDoc(doc(db, '_schema', 'version'), {
      version: 1,
      created_at: new Date().toISOString(),
    });

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}
