import React from 'react';

export const Footer = ({ navigate }) => (
    <footer className="bg-white mt-16 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
            <p className="text-sm">&copy; {new Date().getFullYear()} CompareStuff. All rights reserved.</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('terms'); }} className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                Terms of Use
            </a>
        </div>
    </footer>
);

export default Footer;