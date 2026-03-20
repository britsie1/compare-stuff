import React from 'react';
import { Heart } from 'lucide-react';
import { favoriteTemplate, unfavoriteTemplate } from '../../services/templates';
import { useAuth } from '../../context/authHooks';

const FavoriteButton = ({ templateId, favorites, className = '', onLoginRequest }) => {
    const { currentUser } = useAuth();
    const [isFavorited, setIsFavorited] = React.useState(false);
    const [favoriteCount, setFavoriteCount] = React.useState(Array.isArray(favorites) ? favorites.length : 0);

    React.useEffect(() => {
        if (currentUser && Array.isArray(favorites)) {
            setIsFavorited(favorites.includes(currentUser.uid));
        } else {
            setIsFavorited(false);
        }
        setFavoriteCount(Array.isArray(favorites) ? favorites.length : 0);
    }, [currentUser, favorites]);

    const handleFavorite = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            if (typeof onLoginRequest === 'function') {
                onLoginRequest();
            }
            return;
        }
        try {
            if (isFavorited) {
                await unfavoriteTemplate(templateId, currentUser.uid);
                setIsFavorited(false);
                setFavoriteCount(prev => Math.max(prev - 1, 0));
            } else {
                await favoriteTemplate(templateId, currentUser.uid);
                setIsFavorited(true);
                setFavoriteCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to update favorite status:', error);
            alert('Failed to update favorite status.');
        }
    };

    return (
        <button 
            type="button"
            className={`flex items-center cursor-pointer group focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-1 ${className}`} 
            onClick={handleFavorite} 
            aria-pressed={isFavorited}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            {isFavorited ? (
                <Heart className="w-4 h-4 mr-1.5 text-red-600 fill-red-600" />
            ) : (
                <Heart className="w-4 h-4 mr-1.5 text-red-500" />
            )}
            <span className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors">{favoriteCount}</span>
        </button>
    );
};

export default FavoriteButton;
