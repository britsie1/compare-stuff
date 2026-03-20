import { initializeApp, FirebaseApp } from 'firebase/app';
import firebaseConfig from './config/firebaseConfig';

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

export {
    app
};
