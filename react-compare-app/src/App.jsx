import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { initialData } from './data/mockData';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComparisonList } from './components/comparison/ComparisonList';
import { CreateComparisonForm } from './components/comparison/CreateComparisonForm';
import { ComparisonView } from './components/comparison/ComparisonView';
import { EditComparisonForm } from './components/comparison/EditComparisonForm';
import { TermsPage } from './components/pages/TermsPage';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';

// Main App Component
const App = () => {
    const [page, setPage] = useState('list'); // 'list', 'create', 'view', 'editTemplate', 'terms'
    const [comparisons, setComparisons] = useState([]);
    const [selectedComparisonId, setSelectedComparisonId] = useState(null);
    const { user, loading, logout } = useFirebaseAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    useEffect(() => {
        // Load initial data
        setComparisons(initialData);
    }, []);

    useEffect(() => {
        if (user && isLoginModalOpen) {
            setIsLoginModalOpen(false);
        }
    }, [user, isLoginModalOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            // Optionally reset any user-specific state here
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleCreateComparison = (newComparison) => {
      const fullComparison = {
            ...newComparison,
            id: Date.now(),
            items: [],
            favorites: 0,
            lastUpdated: new Date().toISOString(),
        };
        setComparisons([...comparisons, fullComparison]);
        setPage('list');
    };

    const handleViewComparison = (id) => {
        setSelectedComparisonId(id);
        setPage('view');
    };

    const handleUpdateComparison = (updatedComparison) => {
      const newComparisons = comparisons.map(c =>
            c.id === updatedComparison.id ? { ...c, ...updatedComparison, lastUpdated: new Date().toISOString() } : c
        );
        setComparisons(newComparisons);
        setPage('view'); // Go back to view after updating
    };

    const navigate = (newPage, comparisonId = null) => {
        setPage(newPage);
        if (comparisonId !== null) {
            setSelectedComparisonId(comparisonId);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const selectedComparison = comparisons.find(c => c.id === selectedComparisonId);

    const renderPage = () => {
        switch (page) {
            case 'create':
                return <CreateComparisonForm onSubmit={handleCreateComparison} onCancel={() => setPage('list')} />;
            case 'view':
                return selectedComparison && <ComparisonView comparison={selectedComparison} onUpdate={handleUpdateComparison} onBack={() => setPage('list')} onEditTemplate={() => setPage('editTemplate')} />;
            case 'editTemplate':
                return selectedComparison && <EditComparisonForm comparison={selectedComparison} onSubmit={handleUpdateComparison} onCancel={() => setPage('view')} />;
            case 'terms':
                return <TermsPage onBack={() => setPage('list')} />;
            case 'list':
            default:
                return <ComparisonList comparisons={comparisons} onCreate={() => setPage('create')} onView={handleViewComparison} />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col">
            <Navbar user={user} onLoginClick={() => setIsLoginModalOpen(true)} logout={handleLogout} navigate={navigate} />
            <main className="p-4 md:p-8 flex-grow">
            {renderPage()}
            </main>
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onShowSignUp={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }} />}
            {isSignUpModalOpen && <SignUpModal onClose={() => setIsSignUpModalOpen(false)} />}
            <Footer navigate={navigate} />
        </div>
    );
};

export default App;