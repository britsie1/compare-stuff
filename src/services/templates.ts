import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    increment, 
    where,
    DocumentData,
    QueryDocumentSnapshot,
    DocumentReference
} from 'firebase/firestore';
import { app } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

export interface TemplateField {
    id?: string;
    type: 'field' | 'section';
    value: string;
    fieldType?: 'text' | 'yes-no' | 'currency' | 'link' | 'imageUrl';
}

export interface Template {
    id?: string;
    templateId?: string; // Some parts of the app use this
    title: string;
    description?: string;
    templateFields: TemplateField[];
    lastUpdated: string;
    creator: {
        uid: string;
        displayName: string;
        email: string;
        photoURL?: string;
    };
    contributors: string[];
    status: 'unpublished' | 'private' | 'published';
    favorites?: string[];
    views?: number;
}

export interface ItemValue {
    id: string;
    value: any;
    hint?: string;
}

export interface TemplateItem {
    id?: string;
    title: string;
    values: ItemValue[];
}

// Helper to generate a unique id (uses crypto.randomUUID if available)
function generateFieldId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'field-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

// Function to create a template
export const createTemplate = async (templateData: Partial<Template>, user: any): Promise<Template> => {
    try {
        const now = new Date().toISOString();
        if (!user || (!user.id && !user.uid)) {
            console.error('createTemplate: user object received:', user);
            throw new Error('You must be logged in to create a template.');
        }

        const normalizedFields: TemplateField[] = (templateData.templateFields || []).map(f => {
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

        const template: Omit<Template, 'id'> = {
            title: templateData.title || 'Untitled Comparison',
            description: templateData.description || '',
            templateFields: normalizedFields,
            lastUpdated: now,
            creator: {
                uid: user.id || user.uid,
                displayName: user.name || user.displayName || user.email || 'Unknown User',
                email: user.email || '',
                photoURL: user.photoURL || ''
            },
            contributors: [],
            status: 'unpublished',
            ...templateData,
        };
        const docRef = await addDoc(collection(db, 'templates'), template);
        console.log('Template created with ID:', docRef.id);
        return { id: docRef.id, ...template } as Template;
    } catch (error) {
        console.error('Error adding template:', error);
        throw error;
    }
};

// Function to update a template
export const updateTemplate = async (templateId: string, updatedData: Partial<Template>): Promise<void> => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        let dataToUpdate: any = { ...updatedData };
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
export const deleteTemplate = async (templateId: string): Promise<void> => {
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
export const getTemplate = async (templateId: string, userId: string | null = null): Promise<Template> => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const docSnap = await getDoc(templateRef);
        if (docSnap.exists()) {
            const template = { id: docSnap.id, ...docSnap.data() } as Template;
            
            if (template.status === 'published' || template.status === 'private') {
                return template;
            }

            if (template.status === 'unpublished') {
                if (userId && template.creator && template.creator.uid === userId) {
                    return template;
                }
            }
            throw new Error('You do not have permission to view this template.');

        } else {
            throw new Error('Template not found');
        }
    } catch (error) {
        console.error('Error getting template:', error);
        throw error;
    }
};

interface PaginatedTemplates {
    templates: Template[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

// Function to get a page of templates (paginated)
export const getTemplates = async (pageSize: number = 10, lastVisible: QueryDocumentSnapshot<DocumentData> | null = null): Promise<PaginatedTemplates> => {
    try {
        let q = query(collection(db, 'templates'), where('status', '==', 'published'), orderBy('title'), limit(pageSize));
        if (lastVisible) {
            q = query(collection(db, 'templates'), where('status', '==', 'published'), orderBy('title'), startAfter(lastVisible), limit(pageSize));
        }
        const querySnapshot = await getDocs(q);
        const templates: Template[] = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() } as Template);
        });
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        return { templates, lastVisible: newLastVisible };
    } catch (error) {
        console.error('Error getting templates:', error);
        throw error;
    }
};

// Function to get all templates for a specific user
export const getUserTemplates = async (userId: string): Promise<Template[]> => {
    try {
        if (!userId) {
            throw new Error('User ID is required to fetch user templates.');
        }
        const q = query(collection(db, 'templates'), where('creator.uid', '==', userId), orderBy('title'));
        const querySnapshot = await getDocs(q);
        const templates: Template[] = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() } as Template);
        });
        return templates;
    } catch (error) {
        console.error('Error getting user templates:', error);
        throw error;
    }
};

// Function to set the publication status of a template
export const setTemplateStatus = async (templateId: string, status: 'unpublished' | 'private' | 'published'): Promise<void> => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        await updateDoc(templateRef, { status });
        console.log(`Template ${templateId} status updated to ${status}`);
    } catch (error) {
        console.error('Error updating template status:', error);
        throw error;
    }
};

// Helper to deeply remove undefined values from an object/array
function removeUndefinedDeep(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedDeep);
    } else if (obj && typeof obj === 'object') {
        const result: any = {};
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
export const addTemplateItem = async (templateId: string, itemData: Partial<TemplateItem>): Promise<string> => {
    try {
        let sanitizedValues: ItemValue[] = [];
        if (Array.isArray(itemData.values)) {
            sanitizedValues = itemData.values.map(v => {
                const hint = v.hint !== undefined ? v.hint : '';
                if (v && typeof v.value === 'object' && v.value !== null && ('text' in v.value || 'url' in v.value)) {
                    const text = v.value.text || '';
                    const url = v.value.url || '';
                    if (!text && !url) return { id: v.id, value: '', hint };
                    return { id: v.id, value: { text, url }, hint };
                } else {
                    return { id: v.id, value: v.value !== undefined ? v.value : '', hint };
                }
            });
        }
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
export const updateTemplateItem = async (templateId: string, itemId: string, itemData: Partial<TemplateItem>): Promise<boolean> => {
    try {
        const itemRef = doc(db, 'templates', templateId, 'items', itemId);
        await updateDoc(itemRef, itemData as DocumentData);
        return true;
    } catch (error) {
        console.error('Error updating template item:', error);
        throw error;
    }
};

// Function to get all items for a specific template
export const getTemplateItems = async (templateId: string): Promise<TemplateItem[]> => {
    try {
        const itemsCollection = collection(db, 'templates', templateId, 'items');
        const querySnapshot = await getDocs(itemsCollection);
        const items: TemplateItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let values = Array.isArray(data.values)
                ? data.values.map(v => ({
                    ...v,
                    hint: v && typeof v === 'object' && 'hint' in v ? v.hint : ''
                }))
                : [];
            items.push({ id: doc.id, ...data, values } as TemplateItem);
        });
        return items;
    } catch (error) {
        console.error('Error getting items for template:', error);
        throw error;
    }
};

export const favoriteTemplate = async (templateId: string, userId: string): Promise<void> => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const templateDoc = await getDoc(templateRef);
        if (!templateDoc.exists()) {
            throw new Error('Template not found');
        }
        
        const templateData = templateDoc.data() as Template;
        const favorites = templateData.favorites || [];
        
        if (!favorites.includes(userId)) {
            favorites.push(userId);
            await updateDoc(templateRef, { favorites });
        }
    } catch (error) {
        console.error('Error favoriting template:', error);
        throw error;
    }
}

export const unfavoriteTemplate = async (templateId: string, userId: string): Promise<void> => {
    try {
        const templateRef = doc(db, 'templates', templateId);
        const templateDoc = await getDoc(templateRef);
        if (!templateDoc.exists()) {
            throw new Error('Template not found');
        }
        
        const templateData = templateDoc.data() as Template;
        const favorites = templateData.favorites || [];
        
        if (favorites.includes(userId)) {
            const updatedFavorites = favorites.filter(id => id !== userId);
            await updateDoc(templateRef, { favorites: updatedFavorites });
        }
    } catch (error) {
        console.error('Error unfavoriting template:', error);
        throw error;
    }
}

export const deleteTemplateItem = async (templateId: string, itemId: string): Promise<void> => {
    try {
        const itemRef = doc(db, 'templates', templateId, 'items', itemId);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error('Error deleting item from template:', error);
        throw error;
    }
};

export const incrementTemplateView = async (templateId: string): Promise<void> => {
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
