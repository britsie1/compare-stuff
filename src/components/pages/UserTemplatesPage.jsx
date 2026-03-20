import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setTemplateStatus, getUserTemplates } from '../../services/templates';
import { useAuth } from '../../context/authHooks';
import ComparisonListItem from '../comparison/ComparisonListItem';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const UserTemplatesPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: templates, isLoading, isError, error } = useQuery({
        queryKey: ['userTemplates', currentUser?.uid],
        queryFn: () => getUserTemplates(currentUser.uid),
        enabled: !!currentUser,
    });

    const mutation = useMutation({
        mutationFn: ({ templateId, newStatus }) => setTemplateStatus(templateId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries(['userTemplates', currentUser?.uid]);
        },
        onError: (err) => {
            alert('Failed to update template status. Please try again.');
            console.error(err);
        }
    });

    const handleStatusChange = (templateId, newStatus) => {
        mutation.mutate({ templateId, newStatus });
    };

    const handleViewTemplate = (templateId) => {
        navigate(`/compare/${templateId}`);
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading your templates...</div>;
    }

    if (isError) {
        return <div className="text-center py-10 text-red-500">{error.message}</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-10">Please log in to see your templates.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">My Templates</h1>
            {templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <ComparisonListItem
                            key={template.id}
                            comparison={template}
                            onStatusChange={handleStatusChange}
                            onView={handleViewTemplate}
                            onLoginRequest={() => alert("Please log in to use this feature.")}
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