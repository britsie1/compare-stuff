import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAuth } from '../../context/authHooks';
import TemplateFieldsEditor from './TemplateFieldsEditor';
import { v4 as uuidv4 } from 'uuid';
import { useCreateTemplateMutation } from '../../hooks/queries/useTemplates';
import { Template, TemplateField } from '../../services/templates';
import { toast } from 'sonner';

const templateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description is too long'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateComparisonFormProps {
    onSubmit?: (createdTemplate: Template) => void;
    onCancel: () => void;
}

const CreateComparisonForm: React.FC<CreateComparisonFormProps> = ({ onSubmit, onCancel }) => {
    const { currentUser: user } = useAuth();
    const [fields, setFields] = useState<TemplateField[]>([{ type: 'field', value: '', fieldType: 'text', id: uuidv4() }]);

    const { register, handleSubmit, formState: { errors } } = useForm<TemplateFormData>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            title: '',
            description: '',
            imageUrl: '',
        }
    });

    const createMutation = useCreateTemplateMutation();

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-12 md:rounded-lg md:shadow-xl text-center dark:border dark:border-slate-700 transition-colors">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Access Denied</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">You must be logged in to create a comparison template.</p>
                <Button onClick={onCancel}>Back to comparisons</Button>
            </div>
        );
    }

    const onFormSubmit = (data: TemplateFormData) => {
        const finalFields = fields.map(f => ({ ...f, value: f.value.trim() })).filter(f => f.value !== '');
        
        if (finalFields.length === 0) {
            toast.error('Please provide at least one comparison field.');
            return;
        }

        const templateData: Partial<Template> = {
            ...data,
            templateFields: finalFields
        };

        createMutation.mutate({ templateData, user }, {
            onSuccess: (createdTemplate) => {
                toast.success('Template created successfully!');
                if (onSubmit) onSubmit(createdTemplate);
            },
            onError: (error) => {
                toast.error('Failed to create template: ' + error.message);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-4 md:rounded-lg md:p-8 md:shadow-xl dark:border dark:border-slate-700 transition-colors">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Create a New Comparison Template</h1>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                <div>
                    <Label htmlFor="title">Comparison Title</Label>
                    <Input 
                        id="title" 
                        type="text" 
                        placeholder="e.g., Best Laptops for Students" 
                        {...register('title')}
                        className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>
                <div>
                    <Label htmlFor="description">Short Description</Label>
                    <textarea 
                        id="description" 
                        placeholder="Briefly describe what you are comparing" 
                        rows={3} 
                        {...register('description')}
                        className={`block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                </div>
                <div>
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input 
                        id="imageUrl" 
                        type="text" 
                        placeholder="https://example.com/image.png" 
                        {...register('imageUrl')}
                        className={errors.imageUrl ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.imageUrl && <p className="mt-1 text-sm text-red-500">{errors.imageUrl.message}</p>}
                </div>
                
                <TemplateFieldsEditor fields={fields} setFields={setFields} />
                
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Template'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export { CreateComparisonForm };
