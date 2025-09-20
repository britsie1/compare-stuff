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
        <div className={`flex items-center cursor-pointer group ${className}`} onClick={handleFavorite} tabIndex={0} role="button" aria-pressed={isFavorited}>
            {isFavorited ? (
                <Heart className="w-4 h-4 mr-1.5 text-red-600 fill-red-600" />
            ) : (
                <Heart className="w-4 h-4 mr-1.5 text-red-500" />
            )}
            <span>{favoriteCount}</span>
        </div>
    );
};

export default FavoriteButton;
