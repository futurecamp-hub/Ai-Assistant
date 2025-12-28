import React from 'react';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col p-4 rounded-lg border transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-medium text-sm">{template.name}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          template.marketplace === 'WB' ? 'bg-blue-100 text-blue-800' :
          template.marketplace === 'Ozon' ? 'bg-orange-100 text-orange-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {template.marketplace}
        </span>
      </div>
      <p className="text-xs text-gray-600 text-left">{template.description}</p>
    </button>
  );
};

export default TemplateCard;