import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const ItemFormModal = ({ item = null, fields, onClose, onSave, modalTitle, saveButtonText }) => {
    const [title, setTitle] = useState(item ? item.title : '');
    const [values, setValues] = useState(() => 
        fields.map((_, index) => (item && item.values[index]) || '')
    );

    const handleValueChange = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please provide a title for the item.');
            return;
        }
        onSave({ 
            ...(item || {}), // Spread existing item properties (like id)
            title, 
            values 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">{modalTitle}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-600 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="item-title">Item Title</Label>
                        <Input id="item-title" type="text" placeholder="e.g., Discovery Classic Smart" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <hr className="my-4"/>
                    {fields.map((field, index) => (
                        <div key={index}>
                            <Label htmlFor={`field-${index}`}>{field}</Label>
                            <Input id={`field-${index}`} type="text" placeholder={`Enter value for ${field}`} value={values[index]} onChange={(e) => handleValueChange(index, e.target.value)} />
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 pt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{saveButtonText}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemFormModal;