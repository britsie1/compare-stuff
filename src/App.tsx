import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComparisonList } from './components/comparison/ComparisonList';
import { CreateComparisonForm } from './components/comparison/CreateComparisonForm';
import ComparisonViewWrapper from './components/comparison/wrappers/ComparisonViewWrapper';
import EditComparisonFormWrapper from './components/comparison/wrappers/EditComparisonFormWrapper';
import { TermsPage } from './components/pages/TermsPage';
import UserTemplatesPage from './components/pages/UserTemplatesPage';
import NotificationsPage from './components/pages/NotificationsPage';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/authHooks';
import { Template } from './services/templates';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

// Main App Component
const App: React.FC = () => {
    const { currentUser, loading, logout } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        if (currentUser && isLoginModalOpen) {
            setIsLoginModalOpen(false);
        }
    }, [currentUser, isLoginModalOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            // Optionally reset any user-specific state here
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleCreateComparison = (newComparison: Template) => {
      navigate(`/compare/${newComparison.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
            <Navbar user={currentUser} onLoginClick={() => setIsLoginModalOpen(true)} logout={handleLogout} navigate={navigate} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main className="p-2 md:p-8 flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<PageTransition><ComparisonList onCreate={() => navigate('/create')} onView={id => navigate(`/compare/${id}`)} /></PageTransition>} />
                        <Route path="/create" element={<PageTransition><CreateComparisonForm onSubmit={handleCreateComparison} onCancel={() => navigate('/')} /></PageTransition>} />
                        <Route path="/compare/:id" element={<PageTransition><ComparisonViewWrapper /></PageTransition>} />
                        <Route path="/compare/:id/edit" element={<PageTransition><EditComparisonFormWrapper /></PageTransition>} />
                        <Route path="/terms" element={<PageTransition><TermsPage onBack={() => navigate('/')} /></PageTransition>} />
                        <Route path="/my-templates" element={<PageTransition><UserTemplatesPage /></PageTransition>} />
                        <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
                    </Routes>
                </AnimatePresence>
            </main>
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onShowSignUp={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }} />}
            {isSignUpModalOpen && <SignUpModal onClose={() => setIsSignUpModalOpen(false)} />}
            <Footer navigate={navigate} />
            <Toaster richColors />
        </div>
    );
};

export default App;
