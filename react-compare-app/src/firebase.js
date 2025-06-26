import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import firebaseConfig from './config/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Facebook Auth Provider
const facebookProvider = new FacebookAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

// Function to create a template
export const createTemplate = async (templateData, user) => {
    try {
        const now = new Date().toISOString();
        const template = {
            ...templateData,
            lastUpdated: now,
            creator: user ? {
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || ''
            } : null,
            contributors: [],
        };
        const docRef = await addDoc(collection(db, 'templates'), template);
        console.log('Template created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding template:', error);
        throw error;
    }
};

// Function to update a template
export const updateTemplate = async (templateId, updatedData) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        await updateDoc(templateRef, updatedData);
        console.log('Template updated:', templateId);
    } catch (error) {
        console.error('Error updating template:', error);
        throw error;
    }
};

// Function to delete a template
export const deleteTemplate = async (templateId) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        await deleteDoc(templateRef);
        console.log('Template deleted:', templateId);
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
};

// Function to get a specific template by ID
export const getTemplate = async (templateId) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const docSnap = await getDoc(templateRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error('Template not found');
        }
    } catch (error) {
        console.error('Error getting template:', error);
        throw error;
    }
};

// Function to get a page of templates (paginated)
export const getTemplates = async (pageSize = 10, lastVisible = null) => {
    try {
        let q = query(collection(db, 'templates'), orderBy('title'), limit(pageSize));
        if (lastVisible) {
            q = query(collection(db, 'templates'), orderBy('title'), startAfter(lastVisible), limit(pageSize));
        }
        const querySnapshot = await getDocs(q);
        const templates = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() });
        });
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        return { templates, lastVisible: newLastVisible };
    } catch (error) {
        console.error('Error getting templates:', error);
        throw error;
    }
};

// Function to add a new item to a template
export const addTemplateItem = async (templateId, itemData) => {
    try {
        const itemsCollection = collection(db, 'templates', templateId, 'items');
        const docRef = await addDoc(itemsCollection, itemData);
        console.log('Item added to template:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding item to template:', error);
        throw error;
    }
};

// Function to get all items for a specific template
export const getTemplateItems = async (templateId) => {
    try {
        const itemsCollection = collection(db, 'templates', templateId, 'items');
        const querySnapshot = await getDocs(itemsCollection);
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        return items;
    } catch (error) {
        console.error('Error getting items for template:', error);
        throw error;
    }
};

export {
    auth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    googleProvider,
    facebookProvider,
    app,
    db,
};