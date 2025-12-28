import React from 'react';
import { Mood } from '../types';

interface MoodButtonProps {
  mood: Mood;
  isSelected: boolean;
  onSelect: () => void;
}

const MoodButton: React.FC<MoodButtonProps> = ({ mood, isSelected, onSelect }) => {
  const moodIcons: Record<Mood, string> = {
    clean: '🧼',
    warm: '☀️',
    bright: '💡',
    dark: '🌙',
    professional: '👔'
  };

  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{moodIcons[mood]}</span>
      <span className="capitalize">{mood}</span>
    </button>
  );
};

export default MoodButton;