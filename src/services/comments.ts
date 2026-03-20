import { getFirestore, collection, query, getDocs, addDoc, serverTimestamp, doc, updateDoc, getDoc, Firestore, Timestamp, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { app } from '../firebase';

// Initialize Firestore
const db: Firestore = getFirestore(app);

export interface UserInfo {
    name: string;
    avatar: string;
}

export interface Reply {
    id: string;
    text: string;
    user: UserInfo;
    timestamp: Date | Timestamp;
    votes?: number;
    likes?: number;
    flags?: number;
    userVote?: number;
    userLiked?: boolean;
    userFlagged?: boolean;
}

export interface Comment {
    id: string;
    text: string;
    user: UserInfo;
    timestamp: Date | Timestamp;
    replies?: Reply[];
    votes?: number;
    likes?: number;
    flags?: number;
    userVote?: number;
    userLiked?: boolean;
    userFlagged?: boolean;
}

const convertTimestampsToDates = (data: any): any => {
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        data.timestamp = data.timestamp.toDate();
    }
    if (data.replies && Array.isArray(data.replies)) {
        data.replies = data.replies.map((reply: Reply) => convertTimestampsToDates({ ...reply }));
    }
    return data;
};

/**
 * Fetches comments for a given template ID.
 * @param {string} templateId - The ID of the template.
 * @returns {Promise<Comment[]>} A promise that resolves to an array of comments.
 */
export const getComments = async (templateId: string): Promise<Comment[]> => {
    try {
        const commentsRef = collection(db, 'templates', templateId, 'comments');
        // Order by timestamp if you want the latest comments first
        const q = query(commentsRef); // Add orderBy('timestamp', 'desc') if you have a timestamp field
        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
            const data = doc.data();
            comments.push({ id: doc.id, ...convertTimestampsToDates(data) } as Comment);
        });
        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

/**
 * Adds a new comment to a template.
 * @param {string} templateId - The ID of the template.
 * @param {Partial<Comment>} commentData - The comment data to add.
 * @returns {Promise<Comment>} A promise that resolves to the new comment object.
 */
export const addComment = async (templateId: string, commentData: Partial<Comment>): Promise<Comment> => {
    try {
        const commentsRef = collection(db, 'templates', templateId, 'comments');
        const newCommentRef = await addDoc(commentsRef, {
            ...commentData,
            timestamp: serverTimestamp(), // Use serverTimestamp for consistent timestamps
        });
        // Return the new comment with its ID and a client-side timestamp for immediate UI update
        return { id: newCommentRef.id, ...commentData, timestamp: new Date() } as Comment;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

/**
 * Adds a reply to a comment.
 * This assumes replies are nested within the parent comment's document.
 * @param {string} templateId - The ID of the template.
 * @param {string} parentId - The ID of the parent comment.
 * @param {Partial<Reply>} replyData - The reply data to add.
 * @returns {Promise<Reply>} A promise that resolves to the new reply object.
 */
export const addReply = async (templateId: string, parentId: string, replyData: Partial<Reply>): Promise<Reply> => {
    try {
        const commentRef = doc(db, 'templates', templateId, 'comments', parentId);
        const commentSnap = await getDoc(commentRef);

        if (!commentSnap.exists()) {
            throw new Error('Parent comment not found.');
        }

        const parentComment = commentSnap.data();
        const newReply: Reply = {
            id: `reply-${Date.now()}`, // Client-side ID for new reply
            text: replyData.text || '',
            user: replyData.user as UserInfo,
            timestamp: new Date(), // Use client-side timestamp for array elements
            ...replyData
        };

        const updatedReplies = [...(parentComment.replies || []), newReply];

        await updateDoc(commentRef, { replies: updatedReplies });

        // Return the new reply with a client-side timestamp for immediate UI update
        return { ...newReply, timestamp: new Date() };
    } catch (error) {
        console.error('Error adding reply:', error);
        throw error;
    }
};

/**
 * Updates a comment or reply.
 * This function needs to handle both top-level comments and nested replies.
 * For nested replies, it will fetch the parent comment, update the reply within its array, and then update the parent comment document.
 * @param {string} templateId - The ID of the template.
 * @param {string} commentId - The ID of the comment/reply to update.
 * @param {Partial<Comment | Reply>} updates - The fields to update.
 * @returns {Promise<any>} A promise that resolves to the updated comment/reply object.
 */
export const updateComment = async (templateId: string, commentId: string, updates: Partial<Comment | Reply>): Promise<any> => {
    try {
        const commentsRef = collection(db, 'templates', templateId, 'comments');
        const querySnapshot = await getDocs(commentsRef); // Get all comments to find the one to update

        let foundAndUpdated = false;
        for (const docSnap of querySnapshot.docs) {
            const comment = { id: docSnap.id, ...docSnap.data() } as Comment;

            // Check if it's a top-level comment
            if (comment.id === commentId) {
                const commentRef = doc(db, 'templates', templateId, 'comments', commentId);
                await updateDoc(commentRef, updates as DocumentData);
                foundAndUpdated = true;
                return { id: commentId, ...updates }; // Return updated data
            }

            // Check if it's a reply within this comment
            if (comment.replies && comment.replies.length > 0) {
                const updatedReplies = comment.replies.map((reply: Reply) => {
                    if (reply.id === commentId) {
                        foundAndUpdated = true;
                        return { ...reply, ...updates };
                    }
                    return reply;
                });

                if (foundAndUpdated) {
                    const commentRef = doc(db, 'templates', templateId, 'comments', comment.id);
                    await updateDoc(commentRef, { replies: updatedReplies });
                    return { id: commentId, ...updates }; // Return updated data
                }
            }
        }

        if (!foundAndUpdated) {
            throw new Error('Comment or reply not found for update.');
        }
    } catch (error) {
        console.error('Error updating comment/reply:', error);
        throw error;
    }
};
