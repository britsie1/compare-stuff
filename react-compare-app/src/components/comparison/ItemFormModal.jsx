import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { addTemplateItem } from '../../firebase';

const ItemFormModal = ({ item = null, fields, onClose, onSave, modalTitle, saveButtonText, templateId }) => {
    // Always map field ids to values for robust matching
    const [title, setTitle] = useState(item ? item.title : '');
    const [values, setValues] = useState(() =>
        fields.map((field, index) => {
            const fieldId = typeof field === 'object' ? field.id : index;
            if (item && Array.isArray(item.values)) {
                // Try to find value by id
                const found = item.values.find(v => v.id === fieldId);
                return found ? found.value : '';
            }
            return '';
        })
    );

    const handleValueChange = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please provide a title for the item.');
            return;
        }
        // Save values as array of {id, value}
        const valueObjects = fields.map((field, idx) => ({
            id: typeof field === 'object' ? field.id : idx,
            value: values[idx] || ''
        }));
        const itemData = {
            ...(item || {}),
            title,
            values: valueObjects
        };
        if (saveButtonText === 'Save Item') {
            if (!templateId) {
                alert('Error: templateId is required to add a new item.');
                return;
            }
            try {
                await addTemplateItem(templateId, itemData);
                onSave && onSave(itemData);
            } catch (error) {
                alert('Failed to add item: ' + error.message);
            }
        } else {
            onSave && onSave(itemData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-900">{modalTitle}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-600 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div>
                        <Label htmlFor="item-title">Item Title</Label>
                        <Input id="item-title" type="text" placeholder="e.g., Discovery Classic Smart" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <hr className="my-4"/>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
                        {fields.map((field, index) => (
                            <div key={field.id || index}>
                                <Label htmlFor={`field-${index}`}>{typeof field === 'object' ? field.label : field}</Label>
                                <Input id={`field-${index}`} type="text" placeholder={`Enter value for ${typeof field === 'object' ? field.label : field}`} value={values[index]} onChange={(e) => handleValueChange(index, e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-4 pt-6 flex-shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{saveButtonText}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ItemFormModal.propTypes = {
    item: PropTypes.object,
    fields: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    modalTitle: PropTypes.string.isRequired,
    saveButtonText: PropTypes.string.isRequired,
    templateId: (props, propName, componentName) => {
        if (props.saveButtonText === 'Save Item' && !props[propName]) {
            return new Error(`Prop '${propName}' is required in '${componentName}' when saveButtonText is 'Save Item'.`);
        }
        return null;
    }
};

export default ItemFormModal;