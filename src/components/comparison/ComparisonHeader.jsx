import React from 'react';
import { Clock } from 'lucide-react';
import FavoriteButton from '../ui/FavoriteButton';
import ViewCount from '../ui/ViewCount';
import { timeAgo } from '../../utils/time';

const ComparisonHeader = ({ comparison }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden mb-8 transition-colors dark:border dark:border-slate-700">
            <img src={comparison.imageUrl || 'https://placehold.co/1200x400/a5b4fc/ffffff?text=Comparison'} alt={comparison.title} className="w-full h-48 md:h-64 object-cover" />
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{comparison.title}</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{comparison.description}</p>
                        <div className="flex items-center gap-6 mt-4 text-slate-500 dark:text-slate-400 text-base">
                            <FavoriteButton templateId={comparison.id || comparison.templateId} favorites={comparison.favorites} />
                            <ViewCount templateId={comparison.id || comparison.templateId} views={comparison.views} incrementOnMount={true} />
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="ml-1">Updated {timeAgo(comparison.lastUpdated)}</span>
                            </div>
                        </div>
                    </div>
                    {comparison.creator && (
                        <div className="flex items-center mt-6 md:mt-0 md:ml-8">
                            <img
                                src={comparison.creator.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comparison.creator.displayName || 'User') + '&background=6366f1&color=fff&size=64'}
                                alt={comparison.creator.displayName || 'User'}
                                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-900 shadow-sm"
                            />
                            <div className="ml-3">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{comparison.creator.displayName || 'Unknown User'}</div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">Creator</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonHeader;
