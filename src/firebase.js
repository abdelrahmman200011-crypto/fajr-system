import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyASIfpFfQ_pUI9GDRKk2UQB_Lh-Jnhfvyg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fajr-system-f62c3.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://fajr-system-f62c3-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fajr-system-f62c3',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fajr-system-f62c3.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '535210374006',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:535210374006:web:786dbfd47c68d70544c057',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-D62DD0HQLX',
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };