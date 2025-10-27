import React, { useState } from 'react';
import { NameStep } from './NameStep';
import { ExperienceStep } from './ExperienceStep';
import { EquipmentStep } from './EquipmentStep';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface EquipmentItem {
  name: string;
  minWeight: number;
  maxWeight: number;
  increment: number;
}

export interface WizardData {
  name: string;
  experience: ExperienceLevel | null;
  equipment: EquipmentItem[];
}

interface ProfileWizardProps {
  onComplete: (data: WizardData) => void;
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    name: '',
    experience: null,
    equipment: [],
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return wizardData.name.trim().length > 0 && wizardData.name.trim().length <= 50;
      case 2:
        return wizardData.experience !== null;
      case 3:
        return true; // Equipment is optional
      default:
        return false;
    }
  };

  const handleFinish = () => {
    if (validateStep()) {
      onComplete(wizardData);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-surface rounded-lg shadow-xl p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of 3</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-brand-cyan' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 1 && (
            <NameStep
              name={wizardData.name}
              onChange={(name) => updateWizardData({ name })}
            />
          )}

          {currentStep === 2 && (
            <ExperienceStep
              experience={wizardData.experience}
              onChange={(experience) => updateWizardData({ experience })}
            />
          )}

          {currentStep === 3 && (
            <EquipmentStep
              equipment={wizardData.equipment}
              onChange={(equipment) => updateWizardData({ equipment })}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className="flex-1 px-6 py-3 bg-brand-cyan text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!validateStep()}
              className="flex-1 px-6 py-3 bg-brand-cyan text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
