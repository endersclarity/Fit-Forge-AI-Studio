import React from 'react';

export interface SkeletonScreenProps {
  className?: string;
}

/**
 * SkeletonScreen - Loading placeholder that matches the Recovery Dashboard layout
 * Features:
 * - Shimmer animation effect
 * - Matches actual dashboard structure
 * - Respects prefers-reduced-motion
 */
export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-background text-white ${className}`}>
      {/* TopNav skeleton */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
            <div className="w-40 h-6 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      <main className="px-6 py-6 pb-32">
        {/* Hero section skeleton */}
        <div className="mb-8">
          <div className="w-48 h-8 bg-white/10 rounded animate-pulse mb-3" />
          <div className="w-full max-w-md h-20 bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Muscle Heat Map skeleton */}
        <div className="mb-8">
          <div className="w-32 h-6 bg-white/10 rounded animate-pulse mb-4" />
          {/* 4 collapsible sections */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-4">
              <div className="w-24 h-6 bg-white/10 rounded animate-pulse mb-2" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Exercise Recommendations skeleton */}
        <div className="mb-8">
          <div className="w-48 h-6 bg-white/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-white/10 px-6 py-4">
        <div className="flex justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
              <div className="w-12 h-3 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* FAB skeleton */}
      <div className="fixed bottom-24 right-6 w-16 h-16 bg-white/10 rounded-full animate-pulse shadow-2xl" />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonScreen;
