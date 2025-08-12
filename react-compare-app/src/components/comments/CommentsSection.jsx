import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { timeAgo } from '../../utils/time';
import { getComments, addComment, addReply, updateComment } from '../../services/comments';
import { useAuth } from '../../context/AuthContext';

// Renders text with highlighted @mentions
const renderTextWithMentions = (text) => {
    if (typeof text !== 'string') return '';
    const parts = text.split(/(@[\w\s-]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return <a href="#" key={index} className="text-blue-500 hover:underline font-semibold">{part}</a>;
        }
        return part;
    });
};

// Represents the form for adding a new comment or reply
const CommentForm = ({ onSubmit, placeholder = "Add a public comment...", cta = "Comment" }) => {
    const [text, setText] = useState('');
    const { currentUser } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start space-x-3 mt-4">
            <img src={currentUser?.photoURL || 'https://placehold.co/40x40/9ca3af/ffffff?text=Me'} alt="My Avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none rounded-lg focus:ring-0 transition-shadow duration-200"
                    placeholder={placeholder}
                    rows="2"
                ></textarea>
                <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => setText('')} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300" disabled={!text.trim()}>
                        {cta}
                    </button>
                </div>
            </div>
        </form>
    );
};


// Represents a single comment or reply
const Comment = ({ comment, onUpdate, onAddReply, templateId }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [areRepliesVisible, setAreRepliesVisible] = useState(true);
    const { currentUser } = useAuth();

    const handleVote = (voteType) => {
        let newVote = 0;
        let voteChange = 0;

        if (voteType === 'up') {
            if (comment.userVote === 1) { // clicking upvote again
                newVote = 0;
                voteChange = -1;
            } else {
                voteChange = comment.userVote === -1 ? 2 : 1;
                newVote = 1;
            }
        } else { // downvote
            if (comment.userVote === -1) { // clicking downvote again
                newVote = 0;
                voteChange = 1;
            } else {
                voteChange = comment.userVote === 1 ? -2 : -1;
                newVote = -1;
            }
        }
        onUpdate(comment.id, { votes: comment.votes + voteChange, userVote: newVote });
    };

    const handleLike = () => {
        onUpdate(comment.id, {
            likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
            userLiked: !comment.userLiked
        });
    };
    
    const handleFlag = () => {
        onUpdate(comment.id, {
             flags: comment.userFlagged ? comment.flags - 1 : comment.flags + 1,
            userFlagged: !comment.userFlagged
        });
    };

    const handleReplySubmit = (text) => {
        const newReply = {
            user: { name: currentUser.displayName || 'Anonymous', avatar: currentUser.photoURL || 'https://placehold.co/40x40/9ca3af/ffffff?text=Me' },
            text,
            votes: 0,
            likes: 0,
            flags: 0,
            userVote: 0,
            userLiked: false,
            userFlagged: false,
            replies: []
        };
        onAddReply(comment.id, newReply);
        setIsReplying(false);
    };

    return (
        <div className="flex items-start space-x-3">
            <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">· {timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{renderTextWithMentions(comment.text)}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 font-medium">
                    {/* Voting */}
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handleVote('up')} className={`p-1 rounded-full hover:bg-gray-200 ${comment.userVote === 1 ? 'text-green-500' : ''}`}>
                            <ChevronUp size={16} />
                        </button>
                        <span className="font-bold text-sm min-w-[20px] text-center">{comment.votes}</span>
                        <button onClick={() => handleVote('down')} className={`p-1 rounded-full hover:bg-gray-200 ${comment.userVote === -1 ? 'text-red-500' : ''}`}>
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    {/* Liking */}
                    <button onClick={handleLike} className={`flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200 ${comment.userLiked ? 'text-pink-500' : ''}`}>
                        <ThumbsUp size={14} />
                        <span>{comment.likes > 0 && comment.likes}</span>
                    </button>
                    
                    {/* Replying */}
                    <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200">
                        <MessageSquare size={14} />
                        <span>Reply</span>
                    </button>

                     {/* Flagging */}
                    <button onClick={handleFlag} className={`flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200 ${comment.userFlagged ? 'text-yellow-500' : ''}`}>
                        <Flag size={14} />
                        <span>{comment.flags > 0 ? `Flagged (${comment.flags})` : 'Flag'}</span>
                    </button>
                </div>

                {isReplying && (
                    <CommentForm
                        onSubmit={handleReplySubmit}
                        placeholder={`Replying to ${comment.user.name}...`}
                        cta="Reply"
                    />
                )}

                {comment.replies && comment.replies.length > 0 && (
                     <div className="mt-3">
                        <button 
                            onClick={() => setAreRepliesVisible(!areRepliesVisible)}
                            className="text-blue-600 text-xs font-semibold flex items-center space-x-1 mb-2 hover:underline"
                        >
                           {areRepliesVisible ? <ChevronUp size={14}/> : <ChevronDown size={14} />}
                           <span>{areRepliesVisible ? 'Hide Replies' : `View ${comment.replies.length} Replies`}</span>
                        </button>
                        {areRepliesVisible && <CommentList comments={comment.replies} onUpdate={onUpdate} onAddReply={onAddReply} isReplyList templateId={templateId} />}
                    </div>
                )}
            </div>
        </div>
    );
};


// Represents the list of comments
const CommentList = ({ comments, onUpdate, onAddReply, isReplyList = false, templateId }) => {
    return (
        <div className={`space-y-6 ${isReplyList ? 'pl-6 border-l-2 border-gray-200' : ''}`}>
            {comments.map(comment => (
                <Comment key={comment.id} comment={comment} onUpdate={onUpdate} onAddReply={onAddReply} templateId={templateId} />
            ))}
        </div>
    );
};


// --- MAIN COMPONENT ---

const CommentsSection = ({ templateId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            const fetchedComments = await getComments(templateId);
            setComments(fetchedComments);
            setLoading(false);
        };
        fetchComments();
    }, [templateId]);

    const handleUpdateComment = async (commentId, updates) => {
        await updateComment(templateId, commentId, updates);
        // For optimistic UI update, we can update the state directly.
        // The recursive update logic is kept for this.
        setComments(prevComments => updateCommentRecursive(prevComments, commentId, updates));
    };
    
    const handleAddReply = async (parentId, replyData) => {
        const newReply = await addReply(templateId, parentId, replyData);
        setComments(prevComments => addReplyRecursive(prevComments, parentId, newReply));
    };

    const handleAddTopLevelComment = async (text) => {
        if (!currentUser) {
            alert("Please log in to comment.");
            return;
        }
        const newCommentData = {
            user: { name: currentUser.displayName || 'Anonymous', avatar: currentUser.photoURL || 'https://placehold.co/40x40/9ca3af/ffffff?text=Me' },
            text: text,
            votes: 0,
            likes: 0,
            flags: 0,
            userVote: 0,
            userLiked: false,
            userFlagged: false,
            replies: []
        };
        const newComment = await addComment(templateId, newCommentData);
        setComments(prevComments => [newComment, ...prevComments]);
    };

    if (loading) {
        return <div>Loading comments...</div>;
    }

    const commentCount = comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);

    return (
        <div>
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900">{commentCount} Comments</h2>
                
                <div className="mt-6">
                    <CommentForm onSubmit={handleAddTopLevelComment} />
                </div>

                <div className="mt-8">
                    <CommentList comments={comments} onUpdate={handleUpdateComment} onAddReply={handleAddReply} templateId={templateId} />
                </div>
            </div>
        </div>
    );
};

export default CommentsSection;


// --- UTILITY FUNCTIONS FOR STATE UPDATE (kept for optimistic UI) ---

// Recursive function to update a comment or reply anywhere in the nested structure
const updateCommentRecursive = (commentsList, commentId, updates) => {
    return commentsList.map(comment => {
        if (comment.id === commentId) {
            return { ...comment, ...updates };
        }
        if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentRecursive(comment.replies, commentId, updates) };
        }
        return comment;
    });
};

// Recursive function to add a reply to a specific comment
const addReplyRecursive = (commentsList, parentId, newReply) => {
    return commentsList.map(comment => {
        if (comment.id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: addReplyRecursive(comment.replies, parentId, newReply) };
        }
        return comment;
    });
};
