import { beforeEach, describe, it, expect } from '@jest/globals';
import * as firestore from 'firebase/firestore'; // Keep this at the top

// Define mockDb and other common mocks here, before jest.mock calls
const mockDb = {};
const mockDocRef = { id: 'mockCommentId' };
const mockCommentSnap = {
    exists: () => true,
    id: 'mockCommentId',
    data: () => ({ text: 'Test Comment', replies: [] }),
};
const mockQuerySnapshot = {
    forEach: (callback) => {
        callback({
            id: 'comment1',
            data: () => ({ text: 'First comment', timestamp: { toDate: () => new Date() } }),
        });
    },
    docs: [
        {
            id: 'comment1',
            data: () => ({ text: 'First comment', timestamp: { toDate: () => new Date() } }),
        },
    ],
};

jest.mock('../firebase', () => ({
    app: {},
}));

// Mock firebase/firestore methods, setting default return values directly in the mock factory
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => mockDb),
    collection: jest.fn(() => ({ id: 'mockCollection' })),
    query: jest.fn(() => ({ id: 'mockQuery' })),
    getDocs: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    addDoc: jest.fn(() => Promise.resolve(mockDocRef)),
    serverTimestamp: jest.fn(() => 'mock a server timestamp'),
    doc: jest.fn(() => ({ id: 'mockDoc' })),
    updateDoc: jest.fn(() => Promise.resolve()),
    getDoc: jest.fn(() => Promise.resolve(mockCommentSnap)),
    FieldValue: {
        arrayUnion: jest.fn((...args) => ['arrayUnion', ...args]),
        arrayRemove: jest.fn((...args) => ['arrayRemove', ...args]),
    },
}));

// Import functions under test AFTER mocks are set up
import { getComments, addComment, addReply, updateComment } from './comments';

beforeEach(() => {
    jest.clearAllMocks();
    // All default mock implementations are set in jest.mock factory.
    // No need to re-set them here.
});

describe('comments service', () => {
    describe('getComments', () => {
        it('should fetch comments for a given template ID', async () => {
            const comments = await getComments('template1');
            expect(firestore.collection).toHaveBeenCalledWith(mockDb, 'templates', 'template1', 'comments');
            expect(firestore.query).toHaveBeenCalled();
            expect(firestore.getDocs).toHaveBeenCalled();
            expect(comments).toEqual([
                {
                    id: 'comment1',
                    text: 'First comment',
                    timestamp: expect.any(Date),
                },
            ]);
        });

        it('should throw an error if fetching comments fails', async () => {
            const error = new Error('Firestore error');
            firestore.getDocs.mockRejectedValue(error);
            await expect(getComments('template1')).rejects.toThrow('Firestore error');
        });
    });

    describe('addComment', () => {
        it('should add a new comment to a template', async () => {
            const commentData = { text: 'New comment', userId: 'user1' };
            const newComment = await addComment('template1', commentData);
            expect(firestore.collection).toHaveBeenCalledWith(mockDb, 'templates', 'template1', 'comments');
            expect(firestore.addDoc).toHaveBeenCalledWith(expect.anything(), {
                ...commentData,
                timestamp: 'mock a server timestamp',
            });
            expect(newComment).toEqual({
                id: 'mockCommentId',
                ...commentData,
                timestamp: expect.any(Date),
            });
        });

        it('should throw an error if adding a comment fails', async () => {
            const error = new Error('Firestore error');
            firestore.addDoc.mockRejectedValue(error);
            await expect(addComment('template1', {})).rejects.toThrow('Firestore error');
        });
    });

    describe('addReply', () => {
        it('should add a reply to a comment', async () => {
            const replyData = { text: 'New reply', userId: 'user2' };
            const newReply = await addReply('template1', 'parent1', replyData);
            expect(firestore.doc).toHaveBeenCalledWith(mockDb, 'templates', 'template1', 'comments', 'parent1');
            expect(firestore.getDoc).toHaveBeenCalled();
            expect(firestore.updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                {
                    replies: [
                        ...mockCommentSnap.data().replies,
                        expect.objectContaining({
                            text: 'New reply',
                            userId: 'user2',
                            timestamp: expect.any(Date),
                        })
                    ]
                }
            );
            expect(newReply).toEqual(expect.objectContaining({
                text: 'New reply',
                userId: 'user2',
                timestamp: expect.any(Date),
            }));
        });

        it('should throw an error if the parent comment is not found', async () => {
            firestore.getDoc.mockResolvedValue({ exists: () => false });
            await expect(addReply('template1', 'nonexistent', {})).rejects.toThrow('Parent comment not found.');
        });

        it('should throw an error if adding a reply fails', async () => {
            const error = new Error('Firestore error');
            // Ensure getDoc resolves to an existing comment so updateDoc is called
            firestore.getDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({ text: 'Test Comment', replies: [] }),
            });
            firestore.updateDoc.mockRejectedValue(error);
            await expect(addReply('template1', 'parent1', {})).rejects.toThrow('Firestore error');
        });
    });

    describe('updateComment', () => {
        it('should update a top-level comment', async () => {
            const updates = { text: 'Updated comment' };
            const mockCommentDoc = {
                id: 'comment1',
                data: () => ({ text: 'Original comment' }),
            };
            // Reset and set mocks for this test only
            firestore.getDocs.mockReset();
            firestore.updateDoc.mockReset();
            firestore.getDocs.mockResolvedValue({
                docs: [mockCommentDoc],
                forEach: (cb) => cb(mockCommentDoc),
            });
            firestore.updateDoc.mockResolvedValue();

            const updatedComment = await updateComment('template1', 'comment1', updates);

            expect(firestore.doc).toHaveBeenCalledWith(undefined, 'templates', 'template1', 'comments', 'comment1');
            expect(firestore.updateDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'mockDoc' }), updates);
            expect(updatedComment).toEqual({ id: 'comment1', ...updates });
        });

        it('should update a nested reply', async () => {
            const updates = { text: 'Updated reply' };
            const originalReply = { id: 'reply1', text: 'Original reply' };
            const mockParentCommentDoc = {
                id: 'comment1',
                data: () => ({
                    text: 'Original comment',
                    replies: [originalReply],
                }),
            };
            // Reset and set mocks for this test only
            firestore.getDocs.mockReset();
            firestore.updateDoc.mockReset();
            firestore.getDocs.mockResolvedValue({
                docs: [mockParentCommentDoc],
                forEach: (cb) => cb(mockParentCommentDoc),
            });
            firestore.updateDoc.mockResolvedValue();

            const updatedReply = await updateComment('template1', 'reply1', updates);

            expect(firestore.doc).toHaveBeenCalledWith(undefined, 'templates', 'template1', 'comments', 'comment1');
            expect(firestore.updateDoc).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'mockDoc' }),
                {
                    replies: [
                        { ...originalReply, ...updates }
                    ]
                }
            );
            expect(updatedReply).toEqual({ id: 'reply1', ...updates });
        });

        it('should throw an error if the comment or reply is not found', async () => {
            firestore.getDocs.mockReset();
            firestore.getDocs.mockResolvedValue({ docs: [], forEach: jest.fn() });
            await expect(updateComment('template1', 'nonexistent', {})).rejects.toThrow('Comment or reply not found for update.');
        });

        it('should throw an error if updating a comment fails', async () => {
            const error = new Error('Firestore error');
            firestore.getDocs.mockReset();
            firestore.updateDoc.mockReset();
            firestore.updateDoc.mockRejectedValue(error);
            const mockCommentDoc = {
                id: 'comment1',
                data: () => ({ text: 'Original comment' }),
            };
            firestore.getDocs.mockResolvedValue({
                docs: [mockCommentDoc],
                forEach: (cb) => cb(mockCommentDoc),
            });

            await expect(updateComment('template1', 'comment1', {})).rejects.toThrow('Firestore error');
        });
    });
});