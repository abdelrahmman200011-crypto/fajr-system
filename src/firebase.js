import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyASIfpFfQ_pUI9GDRKk2UQB_Lh-Jnhfvyg',
  authDomain: 'fajr-system-f62c3.firebaseapp.com',
  databaseURL: 'https://fajr-system-f62c3-default-rtdb.firebaseio.com',
  projectId: 'fajr-system-f62c3',
  storageBucket: 'fajr-system-f62c3.firebasestorage.app',
  messagingSenderId: '535210374006',
  appId: '1:535210374006:web:786dbfd47c68d70544c057',
  measurementId: 'G-D62DD0HQLX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };