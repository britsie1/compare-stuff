import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
    navigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = () => (
    <footer className="bg-white dark:bg-slate-800 mt-16 py-6 border-t dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">&copy; {new Date().getFullYear()} CompareStuff. All rights reserved.</p>
            <Link to="/terms" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline">
                Terms of Use
            </Link>
        </div>
    </footer>
);

export default Footer;
