
import React from 'react';
import { Home, MessageSquare, CheckSquare, Calendar, FileText, Settings, Briefcase, Cloud, Loader2 } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user?: any;
  isSyncing?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, isSyncing }) => {
  const menuItems = [
    { id: View.HOME, label: 'Главная', icon: Home },
    { id: View.ASSISTANT, label: 'Ассистент', icon: MessageSquare },
    { id: View.TASKS, label: 'Задачи', icon: CheckSquare },
    { id: View.CALENDAR, label: 'Календарь', icon: Calendar },
    { id: View.NOTES, label: 'Заметки', icon: FileText },
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-[#202020] border-r border-gray-200 dark:border-[#2f2f2f] flex flex-col hidden md:flex transition-colors duration-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-md transition-colors">
            <Briefcase size={16} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">BizMate</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-900 dark:text-gray-100 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c2c2c] hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4 space-y-2">
        {user && (
          <div className="px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-[#2f2f2f] mb-2 flex items-center justify-between">
             <div className="flex items-center space-x-2 overflow-hidden">
                {isSyncing ? <Loader2 size={14} className="text-indigo-500 animate-spin flex-shrink-0" /> : <Cloud size={14} className="text-green-500 flex-shrink-0" />}
                <span className="text-[10px] font-bold text-gray-500 truncate">{user.email}</span>
             </div>
          </div>
        )}
        
        <button 
          onClick={() => setCurrentView(View.SETTINGS)}
          className={`flex items-center space-x-3 px-3 py-2 transition-colors w-full text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-[#2c2c2c]
             ${currentView === View.SETTINGS ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-[#2c2c2c]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
        >
          <Settings size={20} />
          <span>Настройки</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
