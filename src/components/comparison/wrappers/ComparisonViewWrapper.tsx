import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authHooks';
import { useTemplate } from '../../../hooks/queries/useTemplates';
import { ComparisonView } from '../ComparisonView';

const ComparisonViewWrapper: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const { data: comparison, isLoading, error } = useTemplate(id!, currentUser ? currentUser.uid : null);

    if (isLoading) {
        return <div className="text-center p-12 text-slate-500">Loading...</div>;
    }
    if (error) {
        return <div className="text-center p-12 text-slate-500">{error.message}</div>;
    }
    if (!comparison) {
        return <div className="text-center p-12 text-slate-500">Comparison not found.</div>;
    }
    
    return (
        <ComparisonView 
            comparison={comparison} 
            onBack={() => navigate('/')} 
            onEditTemplate={() => navigate(`/compare/${id}/edit`)} 
        />
    );
};

export default ComparisonViewWrapper;
