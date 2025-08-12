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
        <div key={comparison.id} className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
            <div onClick={() => onView && onView(comparison.id)} className={onView ? "cursor-pointer" : ""}>
                <img src={comparison.imageUrl || `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(comparison.title)}`} alt={comparison.title} className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{comparison.title}</h2>
                    <p className="text-slate-600 text-sm mb-4 flex-grow">{comparison.description}</p>
                </div>
            </div>
            <div className="p-6 pt-0 mt-auto">
                <div className="flex justify-between items-center text-sm text-slate-500 border-t border-slate-100 pt-4">
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
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'published' ? 'bg-green-100 text-green-800' : status === 'private' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                {status}
                            </span>
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                onClick={(e) => e.stopPropagation()}
                                className="border border-gray-300 rounded-md px-2 py-1"
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
