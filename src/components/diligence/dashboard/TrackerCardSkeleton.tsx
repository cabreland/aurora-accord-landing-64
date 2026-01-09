import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

const ShimmerSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn(
    "relative overflow-hidden bg-gray-200 rounded",
    "before:absolute before:inset-0 before:-translate-x-full",
    "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
    "before:animate-shimmer",
    className
  )} />
);

const TrackerCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-300 p-5 space-y-4 animate-pulse-subtle">
      {/* Header skeleton */}
      <div className="flex items-start gap-3">
        <ShimmerSkeleton className="w-11 h-11 rounded-lg" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-5 w-3/4" />
          <ShimmerSkeleton className="h-4 w-1/2" />
        </div>
        <ShimmerSkeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Progress skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-8 w-16" />
        </div>
        <ShimmerSkeleton className="h-2.5 w-full rounded-full" />
      </div>
      
      {/* Category skeletons */}
      <div className="space-y-2">
        <ShimmerSkeleton className="h-3 w-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <ShimmerSkeleton className="h-4 w-16" />
              <ShimmerSkeleton className="h-1.5 flex-1 rounded-full" />
              <ShimmerSkeleton className="h-4 w-10" />
              <ShimmerSkeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <ShimmerSkeleton key={i} className="w-7 h-7 rounded-full border-2 border-white" />
            ))}
          </div>
          <ShimmerSkeleton className="h-3 w-24" />
        </div>
        <ShimmerSkeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
};

export default TrackerCardSkeleton;
