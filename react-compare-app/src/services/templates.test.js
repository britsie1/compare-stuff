import {
    createTemplate, updateTemplate, deleteTemplate, getTemplate, getTemplates, addTemplateItem, updateTemplateItem, getTemplateItems, favoriteTemplate, unfavoriteTemplate, incrementTemplateView
} from './templates';

import jest from 'jest-mock';
import { beforeEach, describe, it, expect } from '@jest/globals';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore methods
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    increment: jest.fn(() => 1),
}));

const mockDb = {};
const mockDocRef = { id: 'mockDocId' };
const mockDocSnap = { exists: () => true, id: 'mockDocId', data: () => ({ title: 'Test Template' }) };
const mockQuerySnapshot = { forEach: cb => cb({ id: 'item1', data: () => ({}) }), docs: [{ id: 'item1', data: () => ({}) }] };
beforeEach(() => {
    jest.clearAllMocks();
    firestore.getFirestore.mockReturnValue(mockDb);
    firestore.addDoc.mockResolvedValue(mockDocRef);
    firestore.doc.mockReturnValue({});
    firestore.getDoc.mockResolvedValue(mockDocSnap);
    firestore.getDocs.mockResolvedValue(mockQuerySnapshot);
    firestore.collection.mockReturnValue({});
    firestore.updateDoc.mockResolvedValue();
    firestore.deleteDoc.mockResolvedValue();
});

describe('templates service', () => {
    it('creates a template', async () => {
        const user = { id: 'u1', name: 'Test User', email: 'test@example.com' };
        const templateData = { title: 'T1', templateFields: [{ type: 'field', value: 'Field1' }] };
        const result = await createTemplate(templateData, user);
        expect(result).toHaveProperty('id', 'mockDocId');
        expect(result).toHaveProperty('title', 'T1');
    });

    it('throws if user is missing in createTemplate', async () => {
        await expect(createTemplate({ title: 'T1' }, null)).rejects.toThrow();
    });

    it('updates a template', async () => {
        await expect(updateTemplate('tid', { title: 'Updated' })).resolves.toBeUndefined();
    });

    it('deletes a template', async () => {
        await expect(deleteTemplate('tid')).resolves.toBeUndefined();
    });

    it('gets a template', async () => {
        const result = await getTemplate('tid');
        expect(result).toHaveProperty('id', 'mockDocId');
        expect(result).toHaveProperty('title', 'Test Template');
    });

    it('gets templates (paginated)', async () => {
        const result = await getTemplates();
        expect(result.templates.length).toBeGreaterThan(0);
        expect(result.templates[0]).toHaveProperty('id', 'item1');
    });

    it('adds a template item', async () => {
        const result = await addTemplateItem('tid', { values: [{ id: 'f1', value: 'v1' }] });
        expect(result).toBe('mockDocId');
    });

    it('updates a template item', async () => {
        await expect(updateTemplateItem('tid', 'iid', { values: [] })).resolves.toBe(true);
    });

    it('gets template items', async () => {
        const result = await getTemplateItems('tid');
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('id', 'item1');
    });
    it('favorites a template', async () => {
        firestore.getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ favorites: [] })
        });
        await expect(favoriteTemplate('tid', 'u1')).resolves.toBeUndefined();
    });

    it('unfavorites a template', async () => {
        firestore.getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ favorites: ['u1'] })
        });
        await expect(unfavoriteTemplate('tid', 'u1')).resolves.toBeUndefined();
    });
});

it('increments template view', async () => {
    await expect(incrementTemplateView('tid')).resolves.toBeUndefined();
});
