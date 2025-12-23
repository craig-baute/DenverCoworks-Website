
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div
            className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded ${className}`}
        />
    );
};

export const SpaceCardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col space-y-4 border border-neutral-100 p-4 rounded-lg">
            <Skeleton className="h-48 w-full rounded-md" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
};

export const EventCardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 border border-neutral-100">
            <Skeleton className="h-32 w-32 md:w-48 shrink-0" />
            <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
    );
};
