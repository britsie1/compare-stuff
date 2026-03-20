export const timeAgo = (date: string | number | Date | any | undefined): string => {
    if (!date) return '';
    
    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date?.toDate === 'function') {
        // Handle Firebase Timestamp
        dateObj = date.toDate();
    } else {
        dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) return '';

    const now = new Date();
    const seconds = Math.round((now.getTime() - dateObj.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
