import React from 'react';
import { Template } from '../types';
import { Check } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onClick }) => {
  const marketplaceBadge = {
    WB: { label: 'WB', color: 'bg-purple-100 text-purple-700' },
    Ozon: { label: 'Ozon', color: 'bg-blue-100 text-blue-700' },
    Both: { label: 'Universal', color: 'bg-gray-100 text-gray-700' },
  }[template.marketplace];

  return (
    <div
      onClick={onClick}
      className={`
        relative min-w-[280px] p-4 rounded-xl border-2 cursor-pointer
        transition-all duration-200 hover:scale-105
        ${isSelected 
          ? 'border-gray-900 bg-gray-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{template.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${marketplaceBadge.color}`}>
          {marketplaceBadge.label}
        </span>
      </div>
      
      <p className="text-sm text-gray-600">{template.description}</p>
    </div>
  );
};
