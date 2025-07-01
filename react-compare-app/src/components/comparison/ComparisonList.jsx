import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { timeAgo } from '../../utils/time';
import FavoriteButton from '../ui/FavoriteButton';
import { LoginModal } from '../auth/LoginModal';
import ViewCount from '../ui/ViewCount';

const ComparisonList = ({ comparisons, onCreate, onView }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

    return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">All Comparisons</h1>
            <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
        </div>
        {isLoginModalOpen && (
            <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
        {comparisons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comparisons.map(comp => (
                    <div key={comp.id} className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out cursor-pointer" onClick={() => onView(comp.id)}>
                        <img src={comp.imageUrl} alt={comp.title} className="w-full h-48 object-cover"/>
                        <div className="p-6 flex flex-col flex-grow">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">{comp.title}</h2>
                            <p className="text-slate-600 text-sm mb-4 flex-grow">{comp.description}</p>
                            <div className="flex justify-between items-center text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-4">
                                    <FavoriteButton templateId={comp.id} favorites={comp.favorites} onLoginRequest={() => setIsLoginModalOpen(true)} />
                                    <ViewCount templateId={comp.id} views={comp.views} />
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    <span>Updated {timeAgo(comp.lastUpdated)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow">
                 <h2 className="text-2xl font-semibold text-slate-700">No comparisons yet!</h2>
                 <p className="text-slate-500 mt-2">Why not be the first to create one?</p>
                 <Button onClick={onCreate} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" /> Create a Comparison
                 </Button>
            </div>
        )}
    </div>
    );
};

export { ComparisonList };