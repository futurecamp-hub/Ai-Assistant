import React from 'react';
import { Style } from '../types';
import { STYLE_LABELS } from '../constants';

interface StyleTagProps {
  style: Style;
  isSelected: boolean;
  onClick: () => void;
}

export const StyleTag: React.FC<StyleTagProps> = ({ style, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-200
        ${isSelected 
          ? 'bg-gray-900 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {STYLE_LABELS[style]}
    </button>
  );
};
