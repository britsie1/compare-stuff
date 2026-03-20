import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authHooks';
import { useTemplate } from '../../../hooks/queries/useTemplates';
import { ComparisonView } from '../ComparisonView';
import { ComparisonTableSkeleton } from '../../ui/Skeleton';

const ComparisonViewWrapper: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const { data: comparison, isLoading, error } = useTemplate(id!, currentUser ? currentUser.uid : null);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate('/')} className="mb-6 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                    Back to All Comparisons
                </button>
                <div className="mb-8">
                    <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-4"></div>
                    <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                </div>
                <ComparisonTableSkeleton />
            </div>
        );
    }
    if (error) {
        return <div className="text-center p-12 text-slate-500">{error.message}</div>;
    }
    if (!comparison) {
        return <div className="text-center p-12 text-slate-500">Comparison not found.</div>;
    }
    
    return (
        <ComparisonView 
            comparison={comparison} 
            onBack={() => navigate('/')} 
            onEditTemplate={() => navigate(`/compare/${id}/edit`)} 
        />
    );
};

export default ComparisonViewWrapper;
