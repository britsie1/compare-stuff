import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComparisonList } from './components/comparison/ComparisonList';
import { CreateComparisonForm } from './components/comparison/CreateComparisonForm';
import { ComparisonView } from './components/comparison/ComparisonView';
import { EditComparisonForm } from './components/comparison/EditComparisonForm';
import { TermsPage } from './components/pages/TermsPage';
import UserTemplatesPage from './components/pages/UserTemplatesPage';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getTemplate } from './services/templates'
import { AuthProvider, useAuth } from './context/AuthContext';
import { useQuery } from '@tanstack/react-query';

// Main App Component
const App = () => {
    const { user, loading, logout } = useFirebaseAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const navigate = useNavigate();

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
      setComparisons([...comparisons, newComparison]);
      navigate(`/compare/${newComparison.id}`);
    };

    const handleUpdateComparison = (updatedComparison) => {
      const newComparisons = comparisons.map(c =>
            c.id === updatedComparison.id ? { ...c, ...updatedComparison, lastUpdated: new Date().toISOString() } : c
        );
        setComparisons(newComparisons);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Helper to get comparison by ID from URL param
    const ComparisonViewWrapper = () => {
        const { id } = useParams();
        const { currentUser } = useAuth();
        const [comparison, setComparison] = React.useState(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(null);

        // Refetch templates on back navigation from CompareView
        React.useEffect(() => {
            setLoading(true);
            setError(null);
            getTemplate(id, currentUser ? currentUser.uid : null)
                .then((data) => {
                    setComparison(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }, [id, currentUser]);

        if (loading) {
            return <div className="text-center p-12 text-slate-500">Loading...</div>;
        }
        if (error) {
            return <div className="text-center p-12 text-slate-500">{error}</div>;
        }
        if (!comparison) {
            return <div className="text-center p-12 text-slate-500">Comparison not found.</div>;
        }
        return <ComparisonView comparison={comparison} onUpdate={handleUpdateComparison} onBack={() => navigate('/')} onEditTemplate={() => navigate(`/compare/${id}/edit`)} />;
    };

    const EditComparisonFormWrapper = () => {
        const { id } = useParams();
        const { data: comparison, isLoading } = useQuery({
            queryKey: ['template', id],
            queryFn: () => getTemplate(id),
            enabled: !!id,
        });

        if (isLoading) {
            return <div className="text-center p-12 text-slate-500">Loading...</div>;
        }

        if (!comparison) {
            return <div className="text-center p-12 text-slate-500">Comparison not found.</div>;
        }
        return <EditComparisonForm comparison={comparison} onSubmit={handleUpdateComparison} onCancel={() => navigate(`/compare/${id}`)} />;
    };

    return (
        <AuthProvider>
            <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col">
                <Navbar user={user} onLoginClick={() => setIsLoginModalOpen(true)} logout={handleLogout} navigate={navigate} />
                <main className="p-2 md:p-8 flex-grow">
                    <Routes>
                        <Route path="/" element={<ComparisonList onCreate={() => navigate('/create')} onView={id => navigate(`/compare/${id}`)} />} />
                        <Route path="/create" element={<CreateComparisonForm onSubmit={handleCreateComparison} onCancel={() => navigate('/')} />} />
                        <Route path="/compare/:id" element={<ComparisonViewWrapper />} />
                        <Route path="/compare/:id/edit" element={<EditComparisonFormWrapper />} />
                        <Route path="/terms" element={<TermsPage onBack={() => navigate('/')} />} />
                        <Route path="/my-templates" element={<UserTemplatesPage />} />
                    </Routes>
                </main>
                {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onShowSignUp={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }} />}
                {isSignUpModalOpen && <SignUpModal onClose={() => setIsSignUpModalOpen(false)} />}
                <Footer navigate={navigate} />
            </div>
        </AuthProvider>
    );
};

export default App;