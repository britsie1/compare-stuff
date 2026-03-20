import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { createTemplate } from '../../services/templates';
import { useAuth } from '../../context/authHooks';
import TemplateFieldsEditor from './TemplateFieldsEditor';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CreateComparisonForm = ({ onSubmit, onCancel }) => {
    const { currentUser: user } = useAuth();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState([{ type: 'field', value: '', fieldType: 'text', id: uuidv4() }]);

    const mutation = useMutation({
        mutationFn: (templateData) => createTemplate(templateData, user),
        onSuccess: (createdTemplate) => {
            queryClient.invalidateQueries(['templates']);
            queryClient.invalidateQueries(['userTemplates', user?.uid]);
            if (onSubmit) onSubmit(createdTemplate);
        },
        onError: (error) => {
            alert('Failed to create template: ' + error.message);
        }
    });

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-12 md:rounded-lg md:shadow-xl text-center dark:border dark:border-slate-700 transition-colors">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Access Denied</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">You must be logged in to create a comparison template.</p>
                <Button onClick={onCancel}>Back to comparisons</Button>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalFields = fields.map(f => ({ ...f, value: f.value.trim() })).filter(f => f.value !== '');
        if (title.trim() && finalFields.length > 0) {
            const templateData = {
                title,
                imageUrl,
                description,
                templateFields: finalFields
            };
            mutation.mutate(templateData);
        } else {
            alert('Please provide a title and at least one field.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-4 md:rounded-lg md:p-8 md:shadow-xl dark:border dark:border-slate-700 transition-colors">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Create a New Comparison Template</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Comparison Title</Label>
                    <Input id="title" type="text" placeholder="e.g., Best Laptops for Students" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="description">Short Description</Label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what you are comparing" rows="3" className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors"></textarea>
                </div>
                <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" type="text" placeholder="https://example.com/image.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <TemplateFieldsEditor fields={fields} setFields={setFields} />
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Creating...' : 'Create Template'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export { CreateComparisonForm };