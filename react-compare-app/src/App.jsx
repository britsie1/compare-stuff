import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComparisonList } from './components/comparison/ComparisonList';
import { CreateComparisonForm } from './components/comparison/CreateComparisonForm';
import { ComparisonView } from './components/comparison/ComparisonView';
import { EditComparisonForm } from './components/comparison/EditComparisonForm';
import { TermsPage } from './components/pages/TermsPage';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getTemplates, getTemplate } from './services/templates'
import { AuthProvider } from './context/AuthContext';

// Main App Component
const App = () => {
    const [comparisons, setComparisons] = useState([]);
    const { user, loading, logout } = useFirebaseAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch templates (used in both initial load and on navigation back to list)
    const fetchTemplates = async () => {
        try {
            const { templates } = await getTemplates(10);
            setComparisons(templates);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Refetch templates when navigating back to the list view
    useEffect(() => {
        if (location.pathname === '/') {
            fetchTemplates();
        }
    }, [location.pathname]);

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
            id: uuidv4(),
            items: [],
            favorites: 0,
            lastUpdated: new Date().toISOString(),
        };
        setComparisons([...comparisons, fullComparison]);
        navigate(`/compare/${fullComparison.id}`);
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
        const [comparison, setComparison] = React.useState(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(null);

        // Refetch templates on back navigation from CompareView
        React.useEffect(() => {
            setLoading(true);
            setError(null);
            getTemplate(id)
                .then((data) => {
                    setComparison(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }, [id]);

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
        const comparison = comparisons.find(c => c.id === id);
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
                        <Route path="/" element={<ComparisonList comparisons={comparisons} onCreate={() => navigate('/create')} onView={id => navigate(`/compare/${id}`)} />} />
                        <Route path="/create" element={<CreateComparisonForm onSubmit={handleCreateComparison} onCancel={() => navigate('/')} />} />
                        <Route path="/compare/:id" element={<ComparisonViewWrapper />} />
                        <Route path="/compare/:id/edit" element={<EditComparisonFormWrapper />} />
                        <Route path="/terms" element={<TermsPage onBack={() => navigate('/')} />} />
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