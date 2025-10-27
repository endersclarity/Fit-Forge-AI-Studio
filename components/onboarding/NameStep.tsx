import React from 'react';

interface NameStepProps {
  name: string;
  onChange: (name: string) => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name, onChange }) => {
  const isValid = name.trim().length > 0 && name.trim().length <= 50;
  const showError = name.trim().length > 50;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
      <p className="text-gray-400 mb-6">We'll use this to personalize your experience</p>

      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-colors"
        placeholder="Enter your name"
        maxLength={50}
        autoFocus
      />

      {showError && (
        <p className="text-red-500 text-sm mt-2">Name must be 50 characters or less</p>
      )}

      {!showError && name.length > 0 && (
        <p className="text-gray-500 text-sm mt-2">{name.length}/50 characters</p>
      )}
    </div>
  );
};
