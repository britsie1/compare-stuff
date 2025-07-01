import React from 'react';
import { Eye } from 'lucide-react';
import { incrementTemplateView } from '../../services/templates';

const SESSION_KEY = 'viewedTemplates';

const ViewCount = ({ templateId, views, className = '', incrementOnMount = false }) => {
    const [viewCount, setViewCount] = React.useState(typeof views === 'number' ? views : 0);

    React.useEffect(() => {
        if (!incrementOnMount) return;
        // Only increment if not already viewed in this session
        let viewed = [];
        try {
            viewed = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
            console.log('Viewed templates from session:', viewed);
        } catch {
            viewed = [];
        }
        if (!viewed.includes(templateId)) {
            incrementTemplateView(templateId)
                .then(() => setViewCount(prev => prev + 1))
                .catch(() => {});
            viewed.push(templateId);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(viewed));
        }
    }, [templateId, incrementOnMount]);

    React.useEffect(() => {
        setViewCount(typeof views === 'number' ? views : 0);
    }, [views]);

    return (
        <div className={`flex items-center gap-1 ${className}`} title="Views">
            <Eye className="w-4 h-4 text-slate-400" />
            <span>{viewCount}</span>
        </div>
    );
};

export default ViewCount;
