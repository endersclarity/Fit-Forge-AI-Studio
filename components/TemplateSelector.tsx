import React, { useState, useEffect } from 'react';
import { WorkoutTemplate } from '../types';
import { templatesAPI } from '../api';
import TemplateCard from './TemplateCard';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (template: WorkoutTemplate) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onLoad,
  onToast,
}) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      onToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    const confirm = window.confirm('Delete this template?');
    if (!confirm) return;

    try {
      await templatesAPI.delete(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      onToast('Template deleted', 'success');
    } catch (error) {
      console.error('Failed to delete template:', error);
      onToast('Failed to delete template', 'error');
    }
  };

  const handleLoad = (template: WorkoutTemplate) => {
    onLoad(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Saved Workouts</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            �
          </button>
        </header>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No templates yet. Create one from the Workout Builder!
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
