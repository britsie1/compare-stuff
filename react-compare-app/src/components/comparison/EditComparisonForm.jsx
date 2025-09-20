import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { deleteTemplate, updateTemplate } from '../../services/templates';
import TemplateFieldsEditor from './TemplateFieldsEditor';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

const EditComparisonForm = ({ comparison, onCancel }) => {
    const [title, setTitle] = useState(comparison.title);
    const [imageUrl, setImageUrl] = useState(comparison.imageUrl);
    const [description, setDescription] = useState(comparison.description);
    const [fields, setFields] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    useEffect(() => {
        setFields(
            (comparison.templateFields || []).map(f => {
                if (f.type === 'section') {
                    return { type: 'section', value: f.value || '', id: f.id };
                } else {
                    return {
                        type: 'field',
                        value: f.value || f.label || '',
                        fieldType: f.fieldType || 'text',
                        id: f.id,
                    };
                }
            })
        );
    }, [comparison.templateFields]);

    const updateMutation = useMutation({
        mutationFn: (updatedData) => updateTemplate(comparison.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries(['template', comparison.id]);
            queryClient.invalidateQueries(['templates']);
            queryClient.invalidateQueries(['userTemplates', currentUser?.uid]);
            if (onCancel) onCancel();
        },
        onError: (error) => {
            alert('Failed to update template: ' + error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTemplate(comparison.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']);
            queryClient.invalidateQueries(['userTemplates', currentUser?.uid]);
            navigate('/');
        },
        onError: (error) => {
            alert('Failed to delete template: ' + error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalFields = fields
            .map(f => {
                if (f.type === 'section') {
                    return { type: 'section', value: f.value, id: f.id };
                } else {
                    return { type: 'field', value: f.value, fieldType: f.fieldType || 'text', id: f.id };
                }
            })
            .filter(f => f.value !== '');
        if (title.trim() && finalFields.length > 0) {
            updateMutation.mutate({
                title,
                imageUrl,
                description,
                templateFields: finalFields,
                lastUpdated: new Date().toISOString(),
            });
        } else {
            alert('Please provide a title and at least one field.');
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        deleteMutation.mutate();
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-4 md:rounded-lg md:p-8 md:shadow-xl">
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