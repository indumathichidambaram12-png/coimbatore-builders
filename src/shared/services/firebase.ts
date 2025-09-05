import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

console.log('Firebase service loaded');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANkCZF-O0xm-McJMTiTCFK83Nq6WFNJSs",
  authDomain: "coimbatore-builders369.firebaseapp.com",
  projectId: "coimbatore-builders369",
  storageBucket: "coimbatore-builders369.firebasestorage.app",
  messagingSenderId: "848470100087",
  appId: "1:848470100087:web:e1bec3df5467bfeaaa9e72",
  measurementId: "G-Z8J29N46HT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
