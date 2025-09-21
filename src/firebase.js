import { initializeApp } from 'firebase/app';
import firebaseConfig from './config/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {
    app
};