import React from 'react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Notifications</h1>
      <p className="dark:text-slate-400">You have no new notifications.</p>
    </div>
  );
};

export default NotificationsPage;
