import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
    id, 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    required = false, 
    className = '',
    ...props
}, ref) => (
    <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        ref={ref}
        className={`block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors ${className}`}
        {...props}
    />
));

Input.displayName = 'Input';
