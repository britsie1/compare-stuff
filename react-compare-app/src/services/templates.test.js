import {
    createTemplate, updateTemplate, deleteTemplate, getTemplate, getTemplates, addTemplateItem, updateTemplateItem, getTemplateItems, favoriteTemplate, unfavoriteTemplate, incrementTemplateView
} from './templates';


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
        expect(result.templateFields[0]).toEqual({ id: expect.any(String), type: 'field', value: 'Field1', fieldType: 'text' });
    });

    it('creates a template with section and various field types', async () => {
        const user = { id: 'u1', name: 'Test User', email: 'test@example.com' };
        const templateData = {
            title: 'Advanced Template',
            templateFields: [
                { type: 'section', value: 'Section 1' },
                { type: 'field', value: 'Text Field', fieldType: 'text' },
                { type: 'field', value: 'Number Field', fieldType: 'number' },
                { type: 'field', value: 'Link Field', fieldType: 'link' },
            ],
        };
        const result = await createTemplate(templateData, user);
        expect(result).toHaveProperty('id', 'mockDocId');
        expect(result).toHaveProperty('title', 'Advanced Template');
        expect(result.templateFields).toEqual([
            { type: 'section', value: 'Section 1' },
            { id: expect.any(String), type: 'field', value: 'Text Field', fieldType: 'text' },
            { id: expect.any(String), type: 'field', value: 'Number Field', fieldType: 'number' },
            { id: expect.any(String), type: 'field', value: 'Link Field', fieldType: 'link' },
        ]);
    });

    it('throws if user is missing in createTemplate', async () => {
        await expect(createTemplate({ title: 'T1' }, null)).rejects.toThrow();
    });

    it('throws on error when creating a template', async () => {
        firestore.addDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(createTemplate({ title: 'T1' }, { id: 'u1' })).rejects.toThrow('Firestore error');
    });

    it('updates a template', async () => {
        await expect(updateTemplate('tid', { title: 'Updated' })).resolves.toBeUndefined();
    });

    it('throws on error when updating a template', async () => {
        firestore.updateDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(updateTemplate('tid', { title: 'Updated' })).rejects.toThrow('Firestore error');
    });

    it('updates a template with section and various field types', async () => {
        const updatedData = {
            title: 'Updated Advanced Template',
            templateFields: [
                { type: 'section', value: 'Updated Section 1' },
                { id: 'field1', type: 'field', value: 'Updated Text Field', fieldType: 'text' },
                { id: 'field2', type: 'field', value: 'Updated Number Field', fieldType: 'number' },
            ],
        };
        await expect(updateTemplate('tid', updatedData)).resolves.toBeUndefined();
    });

    it('deletes a template', async () => {
        await expect(deleteTemplate('tid')).resolves.toBeUndefined();
    });

    it('throws on error when deleting a template', async () => {
        firestore.deleteDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(deleteTemplate('tid')).rejects.toThrow('Firestore error');
    });

    it('gets a template', async () => {
        const result = await getTemplate('tid');
        expect(result).toHaveProperty('id', 'mockDocId');
        expect(result).toHaveProperty('title', 'Test Template');
    });

    it('throws if template is not found', async () => {
        firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
        await expect(getTemplate('nonExistentId')).rejects.toThrow('Template not found');
    });

    it('gets templates (paginated)', async () => {
        const result = await getTemplates();
        expect(result.templates.length).toBeGreaterThan(0);
        expect(result.templates[0]).toHaveProperty('id', 'item1');
    });

    it('gets templates with pagination (lastVisible)', async () => {
        const mockLastVisible = { id: 'lastItem', data: () => ({}) };
        await getTemplates(10, mockLastVisible);
        expect(firestore.query).toHaveBeenCalledWith(
            expect.anything(),
            firestore.orderBy('title'),
            firestore.startAfter(mockLastVisible),
            firestore.limit(10)
        );
    });

    it('throws on error when getting templates', async () => {
        firestore.getDocs.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(getTemplates()).rejects.toThrow('Firestore error');
    });

    it('adds a template item with various field types', async () => {
        const itemData = {
            values: [
                { id: 'f1', value: 'text value' },
                { id: 'f2', value: { text: 'Google', url: 'https://google.com' } },
                { id: 'f3', value: { text: '', url: '' } }, // Empty link field
                { id: 'f4', value: undefined }, // Undefined value
                { id: 'f5', value: 'another text', hint: 'some hint' }, // With hint
            ],
        };
        const result = await addTemplateItem('tid', itemData);
        expect(result).toBe('mockDocId');
        // Further assertions could be added here to check the mocked addDoc call's arguments
        // to ensure the data is sanitized correctly before being sent to Firestore.
    });

    it('adds a template item and removes undefined values', async () => {
        const itemData = {
            name: 'Test Item',
            description: undefined,
            values: [
                { id: 'f1', value: 'value1' },
                { id: 'f2', value: undefined },
                { id: 'f3', value: 'value3', hint: undefined },
            ],
        };
        await addTemplateItem('tid', itemData);
        // Expect addDoc to be called with sanitized data (no undefined values)
        expect(firestore.addDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                name: 'Test Item',
                values: [
                    { id: 'f1', value: 'value1', hint: '' },
                    { id: 'f2', value: '', hint: '' }, // undefined value should be replaced with empty string
                    { id: 'f3', value: 'value3', hint: '' } // undefined hint should be replaced with empty string
                ],
            })
        );
    });

    it('throws on error when adding a template item', async () => {
        firestore.addDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(addTemplateItem('tid', { values: [] })).rejects.toThrow('Firestore error');
    });

    it('updates a template item', async () => {
        await expect(updateTemplateItem('tid', 'iid', { values: [] })).resolves.toBe(true);
    });

    it('updates a template item with various data types', async () => {
        const itemData = {
            values: [
                { id: 'f1', value: 'updated text' },
                { id: 'f2', value: { text: 'Bing', url: 'https://bing.com' } },
                { id: 'f3', value: 123 },
            ],
            someOtherField: 'test',
        };
        await expect(updateTemplateItem('tid', 'iid', itemData)).resolves.toBe(true);
        expect(firestore.updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            itemData
        );
    });

    it('throws on error when updating a template item', async () => {
        firestore.updateDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(updateTemplateItem('tid', 'iid', { values: [] })).rejects.toThrow('Firestore error');
    });

    it('gets template items', async () => {
        const result = await getTemplateItems('tid');
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('id', 'item1');
    });

    it('throws on error when getting template items', async () => {
        firestore.getDocs.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(getTemplateItems('tid')).rejects.toThrow('Firestore error');
    });
    it('favorites a template', async () => {
        firestore.getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ favorites: [] })
        });
        await expect(favoriteTemplate('tid', 'u1')).resolves.toBeUndefined();
    });

    it('throws if template is not found when favoriting', async () => {
        firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
        await expect(favoriteTemplate('nonExistentId', 'u1')).rejects.toThrow('Template not found');
    });

    it('throws on error when favoriting a template', async () => {
        firestore.getDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(favoriteTemplate('tid', 'u1')).rejects.toThrow('Firestore error');
    });

    it('unfavorites a template', async () => {
        firestore.getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ favorites: ['u1'] })
        });
        await expect(unfavoriteTemplate('tid', 'u1')).resolves.toBeUndefined();
    });

    it('throws if template is not found when unfavoriting', async () => {
        firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
        await expect(unfavoriteTemplate('nonExistentId', 'u1')).rejects.toThrow('Template not found');
    });

    it('throws on error when unfavoriting a template', async () => {
        firestore.getDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(unfavoriteTemplate('tid', 'u1')).rejects.toThrow('Firestore error');
    });
});

it('increments template view', async () => {
    await expect(incrementTemplateView('tid')).resolves.toBeUndefined();
});

it('throws on error when incrementing template view', async () => {
    firestore.updateDoc.mockRejectedValueOnce(new Error('Firestore error'));
    await expect(incrementTemplateView('tid')).rejects.toThrow('Firestore error');
});
