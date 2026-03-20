import React from 'react';
import { Clock } from 'lucide-react';
import { timeAgo } from '../../utils/time';
import FavoriteButton from '../ui/FavoriteButton';
import ViewCount from '../ui/ViewCount';

const ComparisonListItem = ({ comparison, onView, onLoginRequest, onStatusChange }) => {
    const handleStatusChange = (e) => {
        e.stopPropagation(); // prevent triggering onView
        onStatusChange(comparison.id, e.target.value);
    };

    const status = comparison.status;

    return (
        <div key={comparison.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out dark:border dark:border-slate-700">
            <button 
                onClick={() => onView && onView(comparison.id)} 
                className={`w-full text-left block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${onView ? "cursor-pointer" : ""}`}
                aria-label={`View comparison: ${comparison.title}`}
            >
                <img src={comparison.imageUrl || `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(comparison.title)}`} alt={comparison.title} className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{comparison.title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">{comparison.description}</p>
                </div>
            </button>
            <div className="p-6 pt-0 mt-auto">
                <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-4">
                        <FavoriteButton templateId={comparison.id} favorites={comparison.favorites} onLoginRequest={onLoginRequest} />
                        <ViewCount templateId={comparison.id} views={comparison.views} />
                    </div>
                    {comparison.lastUpdated && (
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            <span>Updated {timeAgo(comparison.lastUpdated)}</span>
                        </div>
                    )}
                </div>
                {onStatusChange && status && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : status === 'private' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {status}
                            </span>
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                onClick={(e) => e.stopPropagation()}
                                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-2 py-1"
                            >
                                <option value="unpublished">Unpublished</option>
                                <option value="private">Private</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonListItem;
