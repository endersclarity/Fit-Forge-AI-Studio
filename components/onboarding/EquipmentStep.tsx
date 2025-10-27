import React, { useState } from 'react';
import { EquipmentItem } from './ProfileWizard';

interface EquipmentStepProps {
  equipment: EquipmentItem[];
  onChange: (equipment: EquipmentItem[]) => void;
}

const equipmentTypes = [
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Pull-up Bar',
  'Dip Station',
];

export const EquipmentStep: React.FC<EquipmentStepProps> = ({ equipment, onChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    minWeight: '',
    maxWeight: '',
    increment: '',
  });
  const [formError, setFormError] = useState('');

  const handleAdd = () => {
    // Validation
    if (!formData.name) {
      setFormError('Please select equipment type');
      return;
    }

    const min = parseFloat(formData.minWeight);
    const max = parseFloat(formData.maxWeight);
    const inc = parseFloat(formData.increment);

    if (isNaN(min) || min < 0) {
      setFormError('Minimum weight must be a positive number');
      return;
    }
    if (isNaN(max) || max <= 0) {
      setFormError('Maximum weight must be greater than 0');
      return;
    }
    if (isNaN(inc) || inc <= 0) {
      setFormError('Increment must be greater than 0');
      return;
    }
    if (min >= max) {
      setFormError('Maximum weight must be greater than minimum weight');
      return;
    }
    if (inc > (max - min)) {
      setFormError('Increment is too large for the weight range');
      return;
    }

    // Check for duplicates
    if (equipment.some((item) => item.name === formData.name)) {
      setFormError('This equipment type has already been added');
      return;
    }

    // Add equipment
    const newEquipment: EquipmentItem = {
      name: formData.name,
      minWeight: min,
      maxWeight: max,
      increment: inc,
    };

    onChange([...equipment, newEquipment]);

    // Reset form
    setFormData({ name: '', minWeight: '', maxWeight: '', increment: '' });
    setFormError('');
    setShowForm(false);
  };

  const handleRemove = (index: number) => {
    onChange(equipment.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setFormData({ name: '', minWeight: '', maxWeight: '', increment: '' });
    setFormError('');
    setShowForm(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Equipment Setup</h2>
      <p className="text-gray-400 mb-6">
        Add your available equipment to get better exercise recommendations
      </p>

      {/* Equipment List */}
      {equipment.length > 0 && (
        <div className="mb-4 space-y-2">
          {equipment.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-sm text-gray-400">
                  {item.minWeight} - {item.maxWeight} lbs ({item.increment} lb increments)
                </div>
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:text-red-400 transition-colors ml-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Equipment Form */}
      {showForm ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Equipment Type
            </label>
            <select
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-brand-cyan"
            >
              <option value="">Select equipment</option>
              {equipmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min (lbs)
              </label>
              <input
                type="number"
                value={formData.minWeight}
                onChange={(e) => setFormData({ ...formData, minWeight: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-brand-cyan"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max (lbs)
              </label>
              <input
                type="number"
                value={formData.maxWeight}
                onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-brand-cyan"
                placeholder="100"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Increment
              </label>
              <input
                type="number"
                value={formData.increment}
                onChange={(e) => setFormData({ ...formData, increment: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-brand-cyan"
                placeholder="5"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Add
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
        >
          + Add Equipment
        </button>
      )}

      {equipment.length === 0 && !showForm && (
        <p className="text-gray-500 text-sm text-center mt-4">
          You can add equipment now or skip and add it later in your profile settings
        </p>
      )}
    </div>
  );
};
