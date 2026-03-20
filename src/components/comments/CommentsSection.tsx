import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { timeAgo } from '../../utils/time';
import { useAuth } from '../../context/authHooks';
import { 
    useComments, 
    useAddCommentMutation, 
    useAddReplyMutation, 
    useUpdateCommentMutation 
} from '../../hooks/queries/useComments';
import { Comment as CommentType, Reply as ReplyType } from '../../services/comments';

// Renders text with highlighted @mentions
const renderTextWithMentions = (text: string) => {
    if (typeof text !== 'string') return '';
    const parts = text.split(/(@[\w\s-]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return <span key={index} className="text-blue-500 hover:underline font-semibold cursor-pointer">{part}</span>;
        }
        return part;
    });
};

interface CommentFormProps {
    onSubmit: (text: string) => void;
    placeholder?: string;
    cta?: string;
}

// Represents the form for adding a new comment or reply
const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, placeholder = "Add a public comment...", cta = "Comment" }) => {
    const [text, setText] = useState('');
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    const handleSubmit = (e: React.FormEvent) => {
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
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-0 transition-shadow duration-200"
                    placeholder={placeholder}
                    rows={2}
                ></textarea>
                <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => setText('')} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900" disabled={!text.trim()}>
                        {cta}
                    </button>
                </div>
            </div>
        </form>
    );
};

interface CommentProps {
    comment: CommentType | ReplyType;
    onUpdate: (commentId: string, updates: Partial<CommentType | ReplyType>) => void;
    onAddReply: (parentId: string, replyData: Partial<ReplyType>) => void;
    isLoggedIn: boolean;
}

// Represents a single comment or reply
const Comment: React.FC<CommentProps> = ({ comment, onUpdate, onAddReply, isLoggedIn }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [areRepliesVisible, setAreRepliesVisible] = useState(true);
    const { currentUser } = useAuth();

    const handleVote = (voteType: 'up' | 'down') => {
        if (!isLoggedIn) return;
        let newVote = 0;
        let voteChange = 0;

        const currentVotes = comment.votes || 0;
        const currentUserVote = comment.userVote || 0;

        if (voteType === 'up') {
            if (currentUserVote === 1) { // clicking upvote again
                newVote = 0;
                voteChange = -1;
            } else {
                voteChange = currentUserVote === -1 ? 2 : 1;
                newVote = 1;
            }
        } else { // downvote
            if (currentUserVote === -1) { // clicking downvote again
                newVote = 0;
                voteChange = 1;
            } else {
                voteChange = currentUserVote === 1 ? -2 : -1;
                newVote = -1;
            }
        }
        onUpdate(comment.id, { votes: currentVotes + voteChange, userVote: newVote });
    };

    const handleLike = () => {
        if (!isLoggedIn) return;
        onUpdate(comment.id, {
            likes: comment.userLiked ? (comment.likes || 0) - 1 : (comment.likes || 0) + 1,
            userLiked: !comment.userLiked
        });
    };
    
    const handleFlag = () => {
        if (!isLoggedIn) return;
        onUpdate(comment.id, {
             flags: comment.userFlagged ? (comment.flags || 0) - 1 : (comment.flags || 0) + 1,
            userFlagged: !comment.userFlagged
        });
    };

    const handleReplySubmit = (text: string) => {
        if (!isLoggedIn || !currentUser) return;
        const newReply: Partial<ReplyType> = {
            user: { name: currentUser.displayName || 'Anonymous', avatar: currentUser.photoURL || 'https://placehold.co/40x40/9ca3af/ffffff?text=Me' },
            text,
            votes: 0,
            likes: 0,
            flags: 0,
            userVote: 0,
            userLiked: false,
            userFlagged: false,
        };
        onAddReply(comment.id, newReply);
        setIsReplying(false);
    };

    const replies = (comment as CommentType).replies || [];

    return (
        <div className="flex items-start space-x-3">
            <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{comment.user.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">· {timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{renderTextWithMentions(comment.text)}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {/* Voting */}
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => handleVote('up')} 
                            disabled={!isLoggedIn}
                            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 ${comment.userVote === 1 ? 'text-green-500' : ''} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronUp size={16} />
                        </button>
                        <span className="font-bold text-sm min-w-[20px] text-center">{comment.votes}</span>
                        <button 
                            onClick={() => handleVote('down')} 
                            disabled={!isLoggedIn}
                            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 ${comment.userVote === -1 ? 'text-red-500' : ''} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    {/* Liking */}
                    <button 
                        onClick={handleLike} 
                        disabled={!isLoggedIn}
                        className={`flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 ${comment.userLiked ? 'text-pink-500' : ''} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ThumbsUp size={14} />
                        <span>{(comment.likes ?? 0) > 0 && comment.likes}</span>
                    </button>
                    
                    {/* Replying */}
                    {isLoggedIn && (
                        <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                            <MessageSquare size={14} />
                            <span>Reply</span>
                        </button>
                    )}

                     {/* Flagging */}
                    <button 
                        onClick={handleFlag} 
                        disabled={!isLoggedIn}
                        className={`flex items-center space-x-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 ${comment.userFlagged ? 'text-yellow-500' : ''} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Flag size={14} />
                        <span>{(comment.flags ?? 0) > 0 ? `Flagged (${comment.flags})` : 'Flag'}</span>
                    </button>
                </div>

                {isReplying && (
                    <CommentForm
                        onSubmit={handleReplySubmit}
                        placeholder={`Replying to ${comment.user.name}...`}
                        cta="Reply"
                    />
                )}

                {replies.length > 0 && (
                     <div className="mt-3">
                        <button 
                            onClick={() => setAreRepliesVisible(!areRepliesVisible)}
                            className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center space-x-1 mb-2 hover:underline"
                        >
                           {areRepliesVisible ? <ChevronUp size={14}/> : <ChevronDown size={14} />}
                           <span>{areRepliesVisible ? 'Hide Replies' : `View ${replies.length} Replies`}</span>
                        </button>
                        {areRepliesVisible && <CommentList comments={replies} onUpdate={onUpdate} onAddReply={onAddReply} isReplyList isLoggedIn={isLoggedIn} />}
                    </div>
                )}
            </div>
        </div>
    );
};

interface CommentListProps {
    comments: (CommentType | ReplyType)[];
    onUpdate: (commentId: string, updates: Partial<CommentType | ReplyType>) => void;
    onAddReply: (parentId: string, replyData: Partial<ReplyType>) => void;
    isReplyList?: boolean;
    isLoggedIn: boolean;
}

// Represents the list of comments
const CommentList: React.FC<CommentListProps> = ({ comments, onUpdate, onAddReply, isReplyList = false, isLoggedIn }) => {
    return (
        <div className={`space-y-6 ${isReplyList ? 'pl-6 border-l-2 border-gray-200 dark:border-slate-700' : ''}`}>
            {comments.map(comment => (
                <Comment key={comment.id} comment={comment} onUpdate={onUpdate} onAddReply={onAddReply} isLoggedIn={isLoggedIn} />
            ))}
        </div>
    );
};

interface CommentsSectionProps {
    templateId: string;
}

// --- MAIN COMPONENT ---
const CommentsSection: React.FC<CommentsSectionProps> = ({ templateId }) => {
    const { currentUser } = useAuth();
    const { data: comments = [], isLoading } = useComments(templateId);

    const updateCommentMutation = useUpdateCommentMutation(templateId);
    const addReplyMutation = useAddReplyMutation(templateId);
    const addCommentMutation = useAddCommentMutation(templateId);

    const handleUpdateComment = (commentId: string, updates: Partial<CommentType | ReplyType>) => {
        if (!currentUser) return;
        updateCommentMutation.mutate({ commentId, updates });
    };
    
    const handleAddReply = (parentId: string, replyData: Partial<ReplyType>) => {
        if (!currentUser) return;
        addReplyMutation.mutate({ parentId, replyData });
    };

    const handleAddTopLevelComment = (text: string) => {
        if (!currentUser) {
            alert("Please log in to comment.");
            return;
        }
        const newCommentData: Partial<CommentType> = {
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
        addCommentMutation.mutate(newCommentData);
    };

    if (isLoading) {
        return <div className="text-slate-500 dark:text-slate-400">Loading comments...</div>;
    }

    const commentCount = (comments || []).reduce((acc, comment) => {
        return acc + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 dark:border dark:border-slate-700 transition-colors">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{commentCount} Comments</h2>
                
                <div className="mt-6">
                    {currentUser ? (
                        <CommentForm onSubmit={handleAddTopLevelComment} />
                    ) : (
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-slate-600">
                            <p className="text-gray-600 dark:text-gray-400">Please log in to participate in the discussion.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <CommentList comments={comments} onUpdate={handleUpdateComment} onAddReply={handleAddReply} isLoggedIn={!!currentUser} />
                </div>
            </div>
        </div>
    );
};

export default CommentsSection;
