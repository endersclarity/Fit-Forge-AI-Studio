import React, { useEffect, useState } from 'react';
import { PRInfo } from '../types';

interface PRNotificationProps {
  pr: PRInfo;
  onDismiss: () => void;
}

export const PRNotification: React.FC<PRNotificationProps> = ({ pr, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for slide-out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for slide-out animation
  };

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-2xl p-4 border-2 border-yellow-400">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎉</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-brand-dark">
                {pr.isFirstTime ? 'FIRST TIME!' : 'NEW PR!'}
              </h3>
              <button
                onClick={handleDismiss}
                className="text-brand-dark hover:text-gray-700 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-brand-dark font-semibold">
              {pr.exercise}
            </p>
            {pr.isFirstTime ? (
              <p className="text-sm text-brand-dark mt-1">
                Volume: {pr.newVolume} lbs
              </p>
            ) : (
              <>
                <p className="text-sm text-brand-dark mt-1">
                  Previous: {pr.previousVolume} lbs
                </p>
                <p className="text-sm text-brand-dark font-bold">
                  +{pr.improvement} lbs ({pr.percentIncrease}%)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PRNotificationManagerProps {
  prs: PRInfo[];
  onDismissAll: () => void;
}

export const PRNotificationManager: React.FC<PRNotificationManagerProps> = ({ prs, onDismissAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= prs.length) {
      onDismissAll();
    }
  }, [currentIndex, prs.length, onDismissAll]);

  if (currentIndex >= prs.length) {
    return null;
  }

  const handleDismiss = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return <PRNotification pr={prs[currentIndex]} onDismiss={handleDismiss} />;
};
