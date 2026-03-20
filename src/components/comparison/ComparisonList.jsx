import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoginModal } from '../auth/LoginModal';
import ComparisonListItem from './ComparisonListItem';
import { useQuery } from '@tanstack/react-query';
import { getTemplates } from '../../services/templates';
import { useAuth } from '../../context/authHooks';

const ComparisonList = ({ onCreate, onView }) => {
    const { currentUser } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['templates'],
        queryFn: () => getTemplates(10),
    });

    if (isLoading) {
        return <div className="text-center py-10">Loading comparisons...</div>;
    }

    if (isError) {
        return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
    }

    const comparisons = data?.templates || [];

    const handleCreateClick = () => {
        if (currentUser) {
            onCreate();
        } else {
            setIsLoginModalOpen(true);
        }
    };

    return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Comparisons</h1>
            <Button onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
        </div>
        {isLoginModalOpen && (
            <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
        {comparisons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comparisons.map(comp => (
                    <ComparisonListItem
                        key={comp.id}
                        comparison={comp}
                        onView={onView}
                        onLoginRequest={() => setIsLoginModalOpen(true)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow transition-colors">
                 <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">No comparisons yet!</h2>
                 <p className="text-slate-500 dark:text-slate-400 mt-2">Why not be the first to create one?</p>
                 <Button onClick={handleCreateClick} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" /> Create a Comparison
                 </Button>
            </div>
        )}
    </div>
    );
};

export { ComparisonList };