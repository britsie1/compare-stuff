import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, children, className = '', ...props }) => (
    <label 
        htmlFor={htmlFor} 
        className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors ${className}`}
        {...props}
    >
        {children}
    </label>
);
