import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBcMbLsW9JO9xrpB6AmuRZFuiW6rIAWhxM',
  authDomain: 'farsvpn.firebaseapp.com',
  projectId: 'farsvpn',
  storageBucket: 'farsvpn.firebasestorage.app',
  messagingSenderId: '902220320087',
  appId: '1:902220320087:web:f9c7ade65f18a08cb10212',
  measurementId: 'G-21X45N5CL9',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
