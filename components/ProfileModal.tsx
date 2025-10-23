
import React, { useState, useEffect } from 'react';
import { Difficulty, UserProfile } from '../types';
import { XIcon } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, setProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  const handleSave = () => {
    setProfile(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2 focus:ring-brand-cyan focus:border-brand-cyan"
              placeholder="e.g. Alex"
            />
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-1">Experience Level</label>
            <select
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value as Difficulty })}
              className="w-full bg-brand-dark border border-brand-muted rounded-md px-3 py-2 focus:ring-brand-cyan focus:border-brand-cyan"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
