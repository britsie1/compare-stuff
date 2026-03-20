import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { GoogleIcon } from '../ui/GoogleIcon';
import { FacebookIcon } from '../ui/FacebookIcon';
import {
    auth,
    signInWithEmailAndPassword,
    signInWithPopup,
    googleProvider,
    facebookProvider,
} from '../../services/auth'; // Adjust path if firebase.js is in a different location
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';


const LoginModal = ({ onClose, onShowSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // To disable buttons during login

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // No need to call onLogin, user state will update via hook
        } catch (err) {
            console.error("Email login error:", err);
            setError(err.message || "Failed to sign in with email. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithPopup(auth, provider);
            // No need to call onLogin, user state will update via hook
        } catch (err) {
            console.error("Social login error:", err);
            // Firebase specific error handling for social logins
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account with this email already exists using a different sign-in method.');
            } else {
                setError(err.message || "Failed to sign in with social account.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-slate-300 bg-opacity-60 dark:bg-black dark:bg-opacity-70 flex justify-center items-center p-4 z-50 transition-colors">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-sm relative dark:border dark:border-slate-700">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Sign in to continue.</p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <Button 
                        onClick={() => handleSocialLogin(googleProvider)} 
                        variant="social" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </Button>
                    
                    <Button 
                        onClick={() => handleSocialLogin(facebookProvider)} 
                        variant="social" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        <FacebookIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Signing in...' : 'Continue with Facebook'}
                    </Button>
                </div>
                
                <div className="flex items-center my-6">
                    <hr className="flex-grow border-slate-200 dark:border-slate-700" />
                    <span className="mx-4 text-xs font-medium text-slate-400 dark:text-slate-500">OR</span>
                    <hr className="flex-grow border-slate-200 dark:border-slate-700" />
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Continue with Email'}
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Don't have an account? <button onClick={(e) => { e.preventDefault(); onShowSignUp(); }} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:underline">Sign Up</button>
                </p>

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    By signing in, you agree to our{' '}
                    <a href="#terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                        Terms of Service
                    </a>
                </p>
            </div>
        </div>
    )
};

export { LoginModal };