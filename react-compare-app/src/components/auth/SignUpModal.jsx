import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { GoogleIcon } from '../ui/GoogleIcon';
import { FacebookIcon } from '../ui/FacebookIcon';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import {
    auth,
    signInWithPopup,
    googleProvider,
    facebookProvider,
} from '../../services/auth';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import ReCAPTCHA from 'react-google-recaptcha';

const passwordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
};

const strengthLabel = [
    'Too short',
    'Weak',
    'Fair',
    'Good',
    'Strong',
];

const SignUpModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [passwordScore, setPasswordScore] = useState(0);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordScore(passwordStrength(value));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        if (!captchaValue) {
            setError('Please complete the reCAPTCHA.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (passwordScore < 3) {
            setError('Password is not strong enough.');
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
            // User will be auto-logged in by Firebase
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to sign up.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignUp = async (provider) => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithPopup(auth, provider);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to sign up with social account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-300 bg-opacity-60 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 rounded-full transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
                    <p className="text-slate-500 mt-1 mb-6">Sign up to get started.</p>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <div className="space-y-3">
                    <Button 
                        onClick={() => handleSocialSignUp(googleProvider)} 
                        variant="social" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Signing up...' : 'Sign up with Google'}
                    </Button>
                    <Button 
                        onClick={() => handleSocialSignUp(facebookProvider)} 
                        variant="social" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        <FacebookIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Signing up...' : 'Sign up with Facebook'}
                    </Button>
                </div>
                <div className="flex items-center my-6">
                    <hr className="flex-grow border-slate-200" />
                    <span className="mx-4 text-xs font-medium text-slate-400">OR</span>
                    <hr className="flex-grow border-slate-200" />
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePasswordChange}
                            disabled={isLoading}
                            required
                        />
                        <div className="mt-1 text-xs font-medium text-slate-500">
                            Strength: <span className={
                                passwordScore < 2 ? 'text-red-500' : passwordScore < 3 ? 'text-yellow-500' : 'text-green-600'
                            }>{strengthLabel[passwordScore]}</span>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="my-2">
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={setCaptchaValue}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    By signing up, you agree to our{' '}
                    <a href="#terms" className="text-indigo-600 hover:text-indigo-800">
                        Terms of Service
                    </a>
                </p>
            </div>
        </div>
    );
};

export { SignUpModal };
