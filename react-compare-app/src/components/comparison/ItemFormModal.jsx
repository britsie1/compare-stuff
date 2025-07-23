import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Info, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { deleteTemplateItem } from '../../services/templates';

const groupFieldsBySection = (fields) => {
    const groups = [];
    let currentSection = { name: null, fields: [] };
    fields.forEach((field, idx) => {
        if (field.type === 'section') {
            if (currentSection.fields.length > 0 || currentSection.name) groups.push(currentSection);
            currentSection = { name: field.value, fields: [] };
        } else {
            currentSection.fields.push({ ...field, _idx: idx });
        }
    });
    if (currentSection.fields.length > 0 || currentSection.name) groups.push(currentSection);
    return groups;
};

const ItemFormModal = ({ item = null, fields, onClose, onSave, modalTitle, saveButtonText, templateId, onDelete }) => {
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Always map field ids to values for robust matching
    const [title, setTitle] = useState(item ? item.title : '');
    // For link fields, store as {text, url}, for others as string
    const [values, setValues] = useState(() =>
        fields.map((field, index) => {
            const fieldId = typeof field === 'object' ? field.id : index;
            if (item && Array.isArray(item.values)) {
                const found = item.values.find(v => v.id === fieldId);
                if (found && field.fieldType === 'link') {
                    return found.value || { text: '', url: '' };
                }
                return found ? found.value : (field.fieldType === 'link' ? { text: '', url: '' } : '');
            }
            return field.fieldType === 'link' ? { text: '', url: '' } : '';
        })
    );
    // Collapsible state for sections
    const [openSections, setOpenSections] = useState(() => {
        const groups = groupFieldsBySection(fields);
        return groups.map(() => true);
    });

    // Hint text state for each field (by index)
    const [hints, setHints] = useState(() =>
        fields.map((field, index) => {
            if (item && Array.isArray(item.values)) {
                const fieldId = typeof field === 'object' ? field.id : index;
                const found = item.values.find(v => v.id === fieldId);
                return found && found.hint ? found.hint : '';
            }
            return '';
        })
    );
    const [showHintInput, setShowHintInput] = useState(() =>
        fields.map((field, index) => {
            if (item && Array.isArray(item.values)) {
                const fieldId = typeof field === 'object' ? field.id : index;
                const found = item.values.find(v => v.id === fieldId);
                return found && found.hint ? true : false;
            }
            return false;
        })
    );

    const handleValueChange = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    const handleLinkChange = (index, part, val) => {
        const newValues = [...values];
        newValues[index] = { ...newValues[index], [part]: val };
        setValues(newValues);
    };

    const handleSectionToggle = (sectionIdx) => {
        setOpenSections(prev => prev.map((open, idx) => idx === sectionIdx ? !open : open));
    };

    const handleHintChange = (index, value) => {
        const newHints = [...hints];
        newHints[index] = value;
        setHints(newHints);
    };

    const handleToggleHintInput = (index) => {
        setShowHintInput(prev => prev.map((show, i) => i === index ? !show : show));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please provide a title for the item.');
            return;
        }
        // Sanitize values: for link fields, store empty string if both text and url are empty; never store undefined
        const valueObjects = fields.map((field, idx) => {
            // Always use the field's unique id if present, fallback to index only if absolutely necessary
            const fieldId = (field && typeof field === 'object' && field.id != null && field.id !== '') ? field.id : idx;
            let hint = hints[idx] || '';
            if (field.fieldType === 'link') {
                const val = values[idx] || { text: '', url: '' };
                if (!val.text && !val.url) {
                    return { id: fieldId, value: '', hint };
                }
                return { id: fieldId, value: { text: val.text || '', url: val.url || '' }, hint };
            } else {
                return { id: fieldId, value: values[idx] !== undefined ? values[idx] : '', hint };
            }
        });
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
                // Do not call addTemplateItem here; let parent handle DB insert
                onSave && onSave(itemData);
            } catch (error) {
                alert('Failed to add item: ' + error.message);
            }
        } else {
            onSave && onSave(itemData);
        }
    };

    const handleDeleteItem = async () => {
        if (!templateId || !item || !item.id) {
            alert('Error: templateId and item ID are required to delete an item.');
            return;
        }
        try {
            onDelete && onDelete(templateId, item.id);
            onClose(); // Close the modal after successful deletion
        } catch (error) {
            alert('Failed to delete item: ' + error.message);
        }
    };

    const fieldInput = (field, index) => {
        // Button to toggle hint input
        const hintButton = (
            <button
                type="button"
                className={`ml-2 p-1 rounded-full border border-slate-200 transition-colors flex items-center justify-center ${showHintInput[index] || hints[index] ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-100'}`}
                onClick={() => handleToggleHintInput(index)}
                aria-label={showHintInput[index] ? 'Hide hint' : (hints[index] ? 'Edit hint' : 'Add hint')}
                title={showHintInput[index] ? 'Hide hint' : (hints[index] ? 'Edit hint' : 'Add hint')}
            >
                <Info className="h-4 w-4" />
            </button>
        );
        const hintInput = showHintInput[index] && (
            <textarea
                className="block w-full mt-2 p-2 border border-slate-200 rounded text-sm resize-y min-h-[40px]"
                placeholder="Add a hint or context for this field (optional)"
                value={hints[index]}
                onChange={e => handleHintChange(index, e.target.value)}
            />
        );
        if (field.fieldType === 'yes-no') {
            return (
                <div>
                    <div className="flex items-center mt-2 gap-2">
                        <input id={`field-${index}-yes`} type="radio" name={`field-${index}`} value="Yes" checked={values[index] === 'Yes'} onChange={(e) => handleValueChange(index, e.target.value)}  />
                        <Label htmlFor={`field-${index}-yes`} className="mr-2">Yes</Label>
                        <input id={`field-${index}-no`} type="radio" name={`field-${index}`} value="No" checked={values[index] === 'No'} onChange={(e) => handleValueChange(index, e.target.value)} />
                        <Label htmlFor={`field-${index}-no`}>No</Label>
                        {hintButton}
                    </div>
                    {hintInput}
                </div>
            );
        } else if (field.fieldType === 'number' || field.fieldType === 'currency') {
            return (
                <div>
                    <div className="flex items-center">
                        <Input id={`field-${index}`} type="number" placeholder={`Enter value for ${field.value}`} value={values[index]} onChange={(e) => handleValueChange(index, e.target.value)} />
                        {hintButton}
                    </div>
                    {hintInput}
                </div>
            );
        } else if (field.fieldType === 'link') {
            return (
                <div>
                    <div className="flex gap-2 items-center">
                        <Input id={`field-${index}-text`} type="text" placeholder="Link text" value={values[index]?.text || ''} onChange={e => handleLinkChange(index, 'text', e.target.value)} className="w-1/2" />
                        <Input id={`field-${index}-url`} type="url" placeholder="URL" value={values[index]?.url || ''} onChange={e => handleLinkChange(index, 'url', e.target.value)} className="w-1/2" />
                        {hintButton}
                    </div>
                    {hintInput}
                </div>
            );
        } else {
            return (
                <div>
                    <div className="flex items-center">
                        <Input id={`field-${index}`} type="text" placeholder={`Enter value for ${field.value}`} value={values[index]} onChange={(e) => handleValueChange(index, e.target.value)} />
                        {hintButton}
                    </div>
                    {hintInput}
                </div>
            );
        }
    };

    // Group fields by section
    const fieldGroups = groupFieldsBySection(fields);

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-2 md:p-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                    <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                        {fieldGroups.map((group, sectionIdx) => (
                            <div key={sectionIdx} className="mb-4 border border-gray-200 rounded-lg">
                                {group.name && (
                                    <button type="button" className="w-full flex justify-between items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-t-lg" onClick={() => handleSectionToggle(sectionIdx)}>
                                        <span className="font-bold text-slate-700">{group.name}</span>
                                        <span>{openSections[sectionIdx] ? '▲' : '▼'}</span>
                                    </button>
                                )}
                                <div className="p-2">
                                    {group.fields.map((field, idx) => (
                                        <div key={field.id || field._idx || idx} className="mb-4">
                                            <Label htmlFor={`field-${field._idx}`}>{field.value}</Label>
                                            {fieldInput(field, field._idx)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-4 pt-6 flex-shrink-0">
                        {item && (
                            <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} className="mr-auto">
                                <Trash2 className="h-5 w-5 mr-2" /> Delete Item
                            </Button>
                        )}
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{saveButtonText}</Button>
                    </div>
                </form>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            <Button type="button" variant="danger" onClick={handleDeleteItem}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ItemFormModal.propTypes = {
    item: PropTypes.object,
    fields: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onDelete: PropTypes.func, // Add onDelete prop type
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