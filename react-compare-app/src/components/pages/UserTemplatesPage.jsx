import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserTemplates, setTemplateStatus } from '../../services/templates';
import { useAuth } from '../../context/AuthContext';
import ComparisonListItem from '../comparison/ComparisonListItem';

const UserTemplatesPage = () => {
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            const fetchTemplates = async () => {
                try {
                    setLoading(true);
                    const userTemplates = await getUserTemplates(currentUser.uid);
                    setTemplates(userTemplates);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch templates. Please try again later.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplates();
        }
    }, [currentUser]);

    const handleStatusChange = async (templateId, newStatus) => {
        try {
            await setTemplateStatus(templateId, newStatus);
            setTemplates(prevTemplates =>
                prevTemplates.map(t => (t.id === templateId ? { ...t, status: newStatus } : t))
            );
        } catch (err) {
            alert('Failed to update template status. Please try again.');
            console.error(err);
        }
    };

    const handleViewTemplate = (templateId) => {
        navigate(`/compare/${templateId}`);
    };

    if (loading) {
        return <div className="text-center py-10">Loading your templates...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-10">Please log in to see your templates.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Templates</h1>
            {templates.length > 0 ? (
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
                <p>You haven't created any templates yet.</p>
            )}
        </div>
    );
};

export default UserTemplatesPage;