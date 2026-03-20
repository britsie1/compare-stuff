import React, { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, User, ChevronDown, Bell, Sun, Moon } from 'lucide-react';

import { Button } from '../ui/Button';

const Navbar = ({ user, onLoginClick, logout, navigate, darkMode, toggleDarkMode }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <nav className="bg-white dark:bg-slate-800 shadow-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => navigate('/')}>
                        <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5" />
                            <path d="M12 12l8 -4.5" />
                            <path d="M12 12v9" />
                            <path d="M12 12l-8 -4.5" />
                            <path d="M8 5.25l4 2.25l4 -2.25" />
                            <path d="M8 18.75l4 -2.25l4 2.25" />
                        </svg>
                        <span className="ml-2 text-xl font-bold text-slate-800 dark:text-white">CompareStuff</span>
                    </div>

                    {/* Navbar Right Side */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <>
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                                    aria-label="View notifications"
                                >
                                    <Bell className="h-6 w-6" />
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white focus:outline-none"
                                    >
                                        <img
                                            src={user.photoURL || 'https://via.placeholder.com/32'}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full object-cover dark:border-slate-600"
                                        />
                                        <span className="font-medium hidden sm:block">{user.name}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 dark:border dark:border-slate-700">
                                            <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border-b dark:border-slate-700">
                                                Signed in as<br />
                                                <strong className="font-medium dark:text-white">{user.email}</strong>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigate('/my-templates');
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                My Templates
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
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
};

export { Navbar };