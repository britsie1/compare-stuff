import React, { useState, useEffect } from 'react';
import { getUserTemplates, setTemplateStatus } from '../../services/templates';
import { useAuth } from '../../context/AuthContext';

const UserTemplatesPage = () => {
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <div key={template.id} className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
                            <p className="text-gray-600 mb-4">{template.description}</p>
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${template.status === 'published' ? 'bg-green-100 text-green-800' : template.status === 'private' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {template.status}
                                </span>
                                <select
                                    value={template.status}
                                    onChange={(e) => handleStatusChange(template.id, e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1"
                                >
                                    <option value="unpublished">Unpublished</option>
                                    <option value="private">Private</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You haven't created any templates yet.</p>
            )}
        </div>
    );
};

export default UserTemplatesPage;