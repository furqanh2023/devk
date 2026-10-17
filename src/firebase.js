import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA8UDxAj7sAlmraOE-8mfoO1T5DxWYzpXE',
  authDomain: 'devk-interncore.firebaseapp.com',
  projectId: 'devk-interncore',
  storageBucket: 'devk-interncore.firebasestorage.app',
  messagingSenderId: '555128116384',
  appId: '1:555128116384:web:2c93fdb542c888c3a025c5'
};
export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
// Explicit local persistence keeps the same account signed in across browser visits until logout.
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Could not set browser-local auth persistence:', error);
});
