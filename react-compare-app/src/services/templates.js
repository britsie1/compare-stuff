import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, startAfter, increment } from 'firebase/firestore';
import { app } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

// Helper to generate a unique id (uses crypto.randomUUID if available)
function generateFieldId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'field-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

// Function to create a template
// NOTE: Make sure you pass the user object as the second argument when calling this function!
export const createTemplate = async (templateData, user) => {
    try {
        const now = new Date().toISOString();
        // Debug: log user object
        if (!user || !user.id) {
            console.error('createTemplate: user object received:', user);
            throw new Error('You must be logged in to create a template.');
        }
        // Normalize templateFields to support both 'field' and 'section' types, and assign unique id to each field
        const normalizedFields = (templateData.templateFields || []).map(f => {
            if (f.type === 'section') {
                return {
                    type: 'section',
                    value: f.value ? String(f.value).trim() : ''
                };
            } else {
                return {
                    id: f.id || generateFieldId(),
                    type: 'field',
                    value: f.value ? String(f.value).trim() : '',
                    fieldType: f.fieldType || 'text'
                };
            }
        }).filter(f => f.value !== '' || f.type === 'section');

        const template = {
            ...templateData,
            templateFields: normalizedFields,
            lastUpdated: now,
            creator: {
                uid: user.id,
                displayName: user.name || user.email || 'Unknown User',
                email: user.email || '',
                photoURL: user.photoURL || ''
            },
            contributors: [],
        };
        const docRef = await addDoc(collection(db, 'templates'), template);
        console.log('Template created with ID:', docRef.id);
        return { id: docRef.id, ...template };
    } catch (error) {
        console.error('Error adding template:', error);
        throw error;
    }
};

// Function to update a template
export const updateTemplate = async (templateId, updatedData) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        // Normalize templateFields if present to support both 'field' and 'section' types, and assign unique id to each field
        let dataToUpdate = { ...updatedData };
        if (Array.isArray(updatedData.templateFields)) {
            dataToUpdate.templateFields = updatedData.templateFields.map(f => {
                if (f.type === 'section') {
                    return {
                        type: 'section',
                        value: f.value ? String(f.value).trim() : ''
                    };
                } else {
                    return {
                        id: f.id || generateFieldId(),
                        type: 'field',
                        value: f.value ? String(f.value).trim() : '',
                        fieldType: f.fieldType || 'text'
                    };
                }
            }).filter(f => f.value !== '' || f.type === 'section');
        }
        await updateDoc(templateRef, dataToUpdate);
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

// Helper to deeply remove undefined values from an object/array
function removeUndefinedDeep(obj) {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedDeep);
    } else if (obj && typeof obj === 'object') {
        const result = {};
        Object.entries(obj).forEach(([k, v]) => {
            if (v !== undefined) {
                result[k] = removeUndefinedDeep(v);
            }
        });
        return result;
    }
    return obj;
}

// Function to add a new item to a template
export const addTemplateItem = async (templateId, itemData) => {
    try {
        // Sanitize itemData.values before saving
        let sanitizedValues = [];
        if (Array.isArray(itemData.values)) {
            sanitizedValues = itemData.values.map(v => {
                // Support hint property
                const hint = v.hint !== undefined ? v.hint : '';
                if (v && typeof v.value === 'object' && v.value !== null && ('text' in v.value || 'url' in v.value)) {
                    // For link fields, if both text and url are empty, store empty string
                    const text = v.value.text || '';
                    const url = v.value.url || '';
                    if (!text && !url) return { id: v.id, value: '', hint };
                    return { id: v.id, value: { text, url }, hint };
                } else {
                    // For all other fields, never store undefined
                    return { id: v.id, value: v.value !== undefined ? v.value : '', hint };
                }
            });
        }
        // Remove undefined from all of itemData
        const cleanItemData = removeUndefinedDeep({ ...itemData, values: sanitizedValues });
        const itemsCollection = collection(db, 'templates', templateId, 'items');
        const docRef = await addDoc(itemsCollection, cleanItemData);
        console.log('Item added to template:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding item to template:', error);
        throw error;
    }
};

// Function to update a single item in a template's items subcollection
export const updateTemplateItem = async (templateId, itemId, itemData) => {
    try {
        const itemRef = doc(db, 'templates', templateId, 'items', itemId);
        await updateDoc(itemRef, itemData);
        return true;
    } catch (error) {
        console.error('Error updating template item:', error);
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
            const data = doc.data();
            // Ensure each value object in values[] includes the hint property (even if empty)
            let values = Array.isArray(data.values)
                ? data.values.map(v => ({
                    ...v,
                    hint: v && typeof v === 'object' && 'hint' in v ? v.hint : ''
                }))
                : [];
            items.push({ id: doc.id, ...data, values });
        });
        console.log('Items retrieved for template:', templateId, items);
        return items;
    } catch (error) {
        console.error('Error getting items for template:', error);
        throw error;
    }
};

export const favoriteTemplate = async (templateId, userId) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const templateDoc = await getDoc(templateRef);
        if (!templateDoc.exists()) {
            throw new Error('Template not found');
        }
        
        const templateData = templateDoc.data();
        const favorites = templateData.favorites || [];
        
        if (!favorites.includes(userId)) {
            favorites.push(userId);
            await updateDoc(templateRef, { favorites });
            console.log('Template favorited:', templateId);
        } else {
            console.log('Template already favorited by this user:', templateId);
        }
    } catch (error) {
        console.error('Error favoriting template:', error);
        throw error;
    }
}

export const unfavoriteTemplate = async (templateId, userId) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const templateDoc = await getDoc(templateRef);
        if (!templateDoc.exists()) {
            throw new Error('Template not found');
        }
        
        const templateData = templateDoc.data();
        const favorites = templateData.favorites || [];
        
        if (favorites.includes(userId)) {
            const updatedFavorites = favorites.filter(id => id !== userId);
            await updateDoc(templateRef, { favorites: updatedFavorites });
            console.log('Template unfavorited:', templateId);
        } else {
            console.log('Template was not favorited by this user:', templateId);
        }
    } catch (error) {
        console.error('Error unfavoriting template:', error);
        throw error;
    }
}

export const incrementTemplateView = async (templateId) => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        await updateDoc(templateRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing template view:', error);
        throw error;
    }
};