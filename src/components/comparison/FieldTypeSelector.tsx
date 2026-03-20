import React from 'react';
import { TemplateField } from '../../services/templates';

interface FieldTypeSelectorProps {
    value: TemplateField['fieldType'];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ value, onChange }) => {
    const fieldTypes: { value: TemplateField['fieldType']; label: string }[] = [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'yes-no', label: 'Yes/No' },
        { value: 'currency', label: 'Currency' },
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
