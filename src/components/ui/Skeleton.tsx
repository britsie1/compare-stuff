import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export const ComparisonItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden dark:border dark:border-slate-700 h-full">
      <Skeleton height={192} />
      <div className="p-6 flex flex-col flex-grow">
        <Skeleton height={28} width="80%" className="mb-2" />
        <Skeleton count={3} className="mb-4" />
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div className="flex gap-4">
                <Skeleton width={40} height={20} />
                <Skeleton width={40} height={20} />
            </div>
            <Skeleton width={100} height={20} />
        </div>
      </div>
    </div>
  );
};

export const CommentSkeleton: React.FC = () => {
    return (
        <div className="flex items-start space-x-3 mb-6">
            <Skeleton circle width={40} height={40} />
            <div className="flex-1">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <Skeleton width={100} height={15} className="mb-2" />
                    <Skeleton count={2} />
                </div>
                <div className="flex items-center space-x-4 mt-2">
                    <Skeleton width={60} height={12} />
                    <Skeleton width={60} height={12} />
                </div>
            </div>
        </div>
    );
};

export const ComparisonTableSkeleton: React.FC = () => {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <Skeleton height={40} />
            </div>
            <div className="p-4">
                <Skeleton count={10} height={50} className="mb-2" />
            </div>
        </div>
    );
};

export default Skeleton;
