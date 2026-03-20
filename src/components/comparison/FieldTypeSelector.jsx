
import React from 'react';

const FieldTypeSelector = ({ value, onChange }) => {
    const fieldTypes = [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'yes-no', label: 'Yes/No' },
        { value: 'link', label: 'Link' },
        { value: 'imageUrl', label: 'Image URL' },
    ];

    return (
        <select
            value={value}
            onChange={onChange}
            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors"
        >
            {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                    {type.label}
                </option>
            ))}
        </select>
    );
};

export default FieldTypeSelector;
