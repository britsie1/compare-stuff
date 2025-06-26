import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { deleteTemplate, updateTemplate } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const EditComparisonForm = ({ comparison, onCancel }) => {
    const [title, setTitle] = useState(comparison.title);
    const [imageUrl, setImageUrl] = useState(comparison.imageUrl);
    const [description, setDescription] = useState(comparison.description);
    const [fields, setFields] = useState(comparison.templateFields);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Add unique IDs to fields if not present
    React.useEffect(() => {
        setFields(prevFields => prevFields.map(f =>
            typeof f === 'string' ? { id: uuidv4(), label: f, isNew: false } : f
        ));
    }, []);

    const handleFieldChange = (index, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], label: value };
        setFields(newFields);
    };

    const addField = () => {
        setFields([...fields, { id: uuidv4(), label: '', isNew: true }]);
    };

    const removeField = (index) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    const moveField = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= fields.length) return;
        const newFields = [...fields];
        const [moved] = newFields.splice(index, 1);
        newFields.splice(newIndex, 0, moved);
        setFields(newFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Remove isNew before saving to DB
        const finalFields = fields
            .map(f => ({ id: f.id, label: f.label.trim() }))
            .filter(f => f.label !== '');
        if (title.trim() && finalFields.length > 0) {
            try {
                await updateTemplate(comparison.id, {
                    title,
                    imageUrl,
                    description,
                    templateFields: finalFields,
                    lastUpdated: new Date().toISOString(),
                });
                if (onCancel) onCancel();
            } catch (error) {
                alert('Failed to update template: ' + error.message);
            }
        } else {
            alert('Please provide a title and at least one field.');
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);
        try {
            await deleteTemplate(comparison.id);
            if (onCancel) onCancel();
        } catch (error) {
            alert('Failed to delete template: ' + error.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Edit Comparison Template</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Comparison Title</Label>
                    <Input id="title" type="text" placeholder="e.g., Best Laptops for Students" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="description">Short Description</Label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what you are comparing" rows="3" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
                </div>
                <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" type="text" placeholder="https://example.com/image.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <div>
                    <Label>Comparison Fields</Label>
                    <p className="text-sm text-slate-500 mb-2">Define the criteria you want to compare.</p>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id || index} className="flex items-center gap-2">
                                <Input type="text" placeholder={`Field ${index + 1}`} value={field.label} onChange={(e) => handleFieldChange(index, e.target.value)} />
                                <div className="flex flex-col">
                                    <button type="button" onClick={() => moveField(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-40">
                                        <span aria-label="Move up" title="Move up">▲</span>
                                    </button>
                                    <button type="button" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-40">
                                        <span aria-label="Move down" title="Move down">▼</span>
                                    </button>
                                </div>
                                <button type="button" onClick={() => removeField(index)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" disabled={fields.length <= 1}>
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" onClick={addField} variant="secondary" className="mt-3">
                        <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Template?</h2>
                        <p className="mb-6 text-slate-700">Are you sure you want to delete this template? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { EditComparisonForm };