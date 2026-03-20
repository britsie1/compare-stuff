import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import TemplateFieldsEditor from './TemplateFieldsEditor';
import { useNavigate } from 'react-router-dom';
import { useUpdateTemplateMutation, useDeleteTemplateMutation } from '../../hooks/queries/useTemplates';
import { Template, TemplateField } from '../../services/templates';
import { toast } from 'sonner';

interface EditComparisonFormProps {
    comparison: Template;
    onCancel: () => void;
}

const EditComparisonForm: React.FC<EditComparisonFormProps> = ({ comparison, onCancel }) => {
    const [title, setTitle] = useState(comparison.title);
    const [imageUrl, setImageUrl] = useState(comparison.imageUrl || '');
    const [description, setDescription] = useState(comparison.description || '');
    const [fields, setFields] = useState<TemplateField[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();

    const updateMutation = useUpdateTemplateMutation();
    const deleteMutation = useDeleteTemplateMutation();

    useEffect(() => {
        setFields(
            (comparison.templateFields || []).map(f => {
                if (f.type === 'section') {
                    return { type: 'section', value: f.value || '', id: f.id };
                } else {
                    return {
                        type: 'field',
                        value: f.value || '',
                        fieldType: f.fieldType || 'text',
                        id: f.id,
                    };
                }
            })
        );
    }, [comparison.templateFields]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFields = fields
            .map(f => {
                if (f.type === 'section') {
                    return { type: 'section', value: f.value, id: f.id } as TemplateField;
                } else {
                    return { type: 'field', value: f.value, fieldType: f.fieldType || 'text', id: f.id } as TemplateField;
                }
            })
            .filter(f => f.value !== '');
        
        if (comparison.id && title.trim() && finalFields.length > 0) {
            updateMutation.mutate({
                templateId: comparison.id,
                updatedData: {
                    title,
                    imageUrl,
                    description,
                    templateFields: finalFields,
                    lastUpdated: new Date().toISOString(),
                }
            }, {
                onSuccess: () => {
                    if (onCancel) onCancel();
                },
                onError: (error) => {
                    toast.error('Failed to update template: ' + error.message);
                }
            });
        } else {
            toast.error('Please provide a title and at least one field.');
        }
    };

    const handleDelete = () => {
        if (!comparison.id) return;
        setShowDeleteConfirm(false);
        deleteMutation.mutate(comparison.id, {
            onSuccess: () => {
                navigate('/');
            },
            onError: (error) => {
                toast.error('Failed to delete template: ' + error.message);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-4 md:rounded-lg md:p-8 md:shadow-xl dark:border dark:border-slate-700 transition-colors">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Edit Comparison Template</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Comparison Title</Label>
                    <Input id="title" type="text" placeholder="e.g., Best Laptops for Students" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="description">Short Description</Label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what you are comparing" rows={3} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors"></textarea>
                </div>
                <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" type="text" placeholder="https://example.com/image.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <TemplateFieldsEditor fields={fields} setFields={setFields} />
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full dark:border dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-500">Delete Template?</h2>
                        <p className="mb-6 text-slate-700 dark:text-slate-300">Are you sure you want to delete this template? This action cannot be undone.</p>
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
