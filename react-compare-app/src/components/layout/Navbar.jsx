import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

const Navbar = ({ user, onLoginClick, logout, navigate }) => (
    <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div 
                    className="flex-shrink-0 flex items-center cursor-pointer" 
                    onClick={() => navigate('list')}
                >
                    <svg className="h-8 w-8 text-indigo-600" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5" />
                        <path d="M12 12l8 -4.5" />
                        <path d="M12 12v9" />
                        <path d="M12 12l-8 -4.5" />
                        <path d="M8 5.25l4 2.25l4 -2.25" />
                        <path d="M8 18.75l4 -2.25l4 2.25" />
                    </svg>
                    <span className="ml-2 text-xl font-bold text-slate-800">CompareIt</span>
                </div>
                <div className="flex items-center">
                    {user ? (
                        <>
                            <span className="text-slate-600 mr-4">Welcome, {user.name}!</span>
                            <Button onClick={logout} variant="secondary">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </>
                    ) : (
                        <Button onClick={onLoginClick}>
                            <LogIn className="mr-2 h-4 w-4" /> Login
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </nav>
);

export default Navbar;