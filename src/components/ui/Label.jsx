import React from 'react';

export const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
        {children}
    </label>
);