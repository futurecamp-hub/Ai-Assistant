
import React from 'react';
import { Home, MessageSquare, CheckSquare, Calendar, FileText } from 'lucide-react';
import { View } from '../types';

interface BottomNavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: View.HOME, label: 'Главная', icon: Home },
    { id: View.ASSISTANT, label: 'Чат', icon: MessageSquare },
    { id: View.TASKS, label: 'Задачи', icon: CheckSquare },
    { id: View.CALENDAR, label: 'Календарь', icon: Calendar },
    { id: View.NOTES, label: 'Заметки', icon: FileText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#191919] border-t border-gray-200 dark:border-[#2f2f2f] px-2 py-2 pb-safe flex justify-between items-center z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center space-y-1 w-[20%] ${
              isActive ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
