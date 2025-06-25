import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const CreateComparisonForm = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState(['']);

    const handleFieldChange = (index, value) => {
        const newFields = [...fields];
        newFields[index] = value;
        setFields(newFields);
    };

    const addField = () => {
        setFields([...fields, '']);
    };

    const removeField = (index) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalFields = fields.map(f => f.trim()).filter(f => f !== '');
        if (title.trim() && finalFields.length > 0) {
            onSubmit({ title, imageUrl, description, templateFields: finalFields });
        } else {
            alert('Please provide a title and at least one field.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Create a New Comparison Template</h1>
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
                    <p className="text-sm text-slate-500 mb-2">Define the criteria you want to compare. At least one is required.</p>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input type="text" placeholder={`Field ${index + 1} (e.g., Price)`} value={field} onChange={(e) => handleFieldChange(index, e.target.value)} />
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
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Template</Button>
                </div>
            </form>
        </div>
    );
};

export { CreateComparisonForm };