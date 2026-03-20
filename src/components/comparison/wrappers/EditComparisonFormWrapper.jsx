import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authHooks';
import { useTemplate } from '../../../hooks/queries/useTemplates';
import { EditComparisonForm } from '../EditComparisonForm';

const EditComparisonFormWrapper = ({ handleUpdateComparison }) => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { data: comparison, isLoading } = useTemplate(id);

    const isOwner = currentUser && comparison?.creator && currentUser.uid === comparison.creator.uid;

    useEffect(() => {
        if (!isLoading && comparison && !isOwner) {
            navigate(`/compare/${id}`);
        }
    }, [isLoading, comparison, isOwner, id, navigate]);

    if (isLoading) {
        return <div className="text-center p-12 text-slate-500">Loading...</div>;
    }

    if (!comparison) {
        return <div className="text-center p-12 text-slate-500">Comparison not found.</div>;
    }

    if (!isOwner) {
        return null;
    }

    return (
        <EditComparisonForm 
            comparison={comparison} 
            onSubmit={handleUpdateComparison} 
            onCancel={() => navigate(`/compare/${id}`)} 
        />
    );
};

export default EditComparisonFormWrapper;
