import React from 'react';
import { Style } from '../types';

interface StyleTagProps {
  style: Style;
  isSelected: boolean;
  onToggle: () => void;
}

const StyleTag: React.FC<StyleTagProps> = ({ style, isSelected, onToggle }) => {
  const styleColors: Record<Style, string> = {
    minimal: 'bg-gray-100 text-gray-800',
    premium: 'bg-yellow-100 text-yellow-800',
    eco: 'bg-green-100 text-green-800',
    fashion: 'bg-pink-100 text-pink-800',
    tech: 'bg-blue-100 text-blue-800',
    lifestyle: 'bg-purple-100 text-purple-800'
  };

  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1 rounded-full text-sm transition-all hover:opacity-80 ${
        isSelected ? `${styleColors[style]} border border-gray-300` : 'bg-gray-100 text-gray-700'
      }`}
    >
      {style}
    </button>
  );
};

export default StyleTag;