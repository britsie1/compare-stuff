import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { GoogleIcon } from '../ui/GoogleIcon';
import { FacebookIcon } from '../ui/FacebookIcon';

const LoginModal = ({ onClose, onLogin }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 rounded-full transition-colors">
                    <X className="h-6 w-6" />
                </button>
                <div className="text-center">
                     <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
                     <p className="text-slate-500 mt-1 mb-6">Sign in to continue.</p>
                </div>
                
                <div className="space-y-3">
                    <Button onClick={onLogin} variant="social" className="w-full">
                        <GoogleIcon /> Continue with Google
                    </Button>
                     <Button onClick={onLogin} variant="social" className="w-full">
                        <FacebookIcon /> Continue with Facebook
                    </Button>
                </div>

                <div className="flex items-center my-6">
                    <hr className="flex-grow border-slate-200"/>
                    <span className="mx-4 text-xs font-medium text-slate-400">OR</span>
                    <hr className="flex-grow border-slate-200"/>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div>
                         <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                     <Button type="submit" className="w-full mt-2">
                        Continue with Email
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); alert("Sign-up UI not implemented yet.");}} className="font-semibold text-indigo-600 hover:text-indigo-500">Sign Up</a>
                </p>
            </div>
        </div>
    )
};

export default LoginModal;