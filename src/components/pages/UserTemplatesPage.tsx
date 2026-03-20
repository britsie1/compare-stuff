import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authHooks';
import ComparisonListItem from '../comparison/ComparisonListItem';
import { useUserTemplates, useSetTemplateStatusMutation } from '../../hooks/queries/useTemplates';
import { Template } from '../../services/templates';
import { toast } from 'sonner';

const UserTemplatesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { data: templates, isLoading, isError, error } = useUserTemplates(currentUser?.uid);

    const statusMutation = useSetTemplateStatusMutation(currentUser?.uid);

    const handleStatusChange = (templateId: string, newStatus: 'unpublished' | 'private' | 'published') => {
        statusMutation.mutate({ templateId, newStatus });
    };

    const handleViewTemplate = (id: string | Template) => {
        const templateId = typeof id === 'string' ? id : (id.id || id.templateId);
        navigate(`/compare/${templateId}`);
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading your templates...</div>;
    }

    if (isError) {
        return <div className="text-center py-10 text-red-500">{error?.message || 'An error occurred'}</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-10">Please log in to see your templates.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">My Templates</h1>
            {templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template: Template) => (
                        <ComparisonListItem
                            key={template.id}
                            comparison={template}
                            onStatusChange={handleStatusChange}
                            onView={handleViewTemplate}
                            onLoginRequest={() => toast.error("Please log in to use this feature.")}
                        />
                    ))}
                </div>
            ) : (
                <p className="dark:text-slate-400">You haven't created any templates yet.</p>
            )}
        </div>
    );
};

export default UserTemplatesPage;
