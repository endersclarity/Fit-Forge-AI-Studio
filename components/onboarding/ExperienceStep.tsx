import React from 'react';
import { ExperienceLevel } from './ProfileWizard';

interface ExperienceStepProps {
  experience: ExperienceLevel | null;
  onChange: (experience: ExperienceLevel) => void;
}

const experienceOptions: Array<{
  level: ExperienceLevel;
  description: string;
}> = [
  {
    level: 'Beginner',
    description: 'New to fitness or returning after a long break',
  },
  {
    level: 'Intermediate',
    description: 'Consistently training for 6+ months with some experience',
  },
  {
    level: 'Advanced',
    description: 'Training for years with solid technique and knowledge',
  },
];

export const ExperienceStep: React.FC<ExperienceStepProps> = ({ experience, onChange }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Experience Level</h2>
      <p className="text-gray-400 mb-6">This helps us provide appropriate starting suggestions</p>

      <div className="space-y-3">
        {experienceOptions.map(({ level, description }) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`w-full text-left px-4 py-4 rounded-lg border transition-all ${
              experience === level
                ? 'bg-brand-cyan bg-opacity-20 border-brand-cyan text-white shadow-md'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  experience === level
                    ? 'border-brand-cyan bg-brand-cyan'
                    : 'border-gray-600'
                }`}
              >
                {experience === level && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg mb-1">{level}</div>
                <div className="text-sm text-gray-400">{description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
