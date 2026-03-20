import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'social' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    className = '',
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500",
        secondary: "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-indigo-500 transition-colors",
        social: "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-indigo-500 transition-colors",
        destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500"
    };
    return (
        <button 
            type={type} 
            onClick={onClick} 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
