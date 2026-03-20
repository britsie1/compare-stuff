import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    Auth,
} from 'firebase/auth';
import { app } from '../firebase';

// Get Auth instance
const auth: Auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Facebook Auth Provider
const facebookProvider = new FacebookAuthProvider();

export {
    auth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    googleProvider,
    facebookProvider,
};
