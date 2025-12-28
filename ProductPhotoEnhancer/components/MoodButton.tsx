import React from 'react';
import { Mood } from '../types';
import { MOOD_LABELS } from '../constants';

interface MoodButtonProps {
  mood: Mood;
  isSelected: boolean;
  onClick: () => void;
}

export const MoodButton: React.FC<MoodButtonProps> = ({ mood, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-lg text-sm font-medium
        transition-all duration-200 border-2
        ${isSelected 
          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {MOOD_LABELS[mood]}
    </button>
  );
};
