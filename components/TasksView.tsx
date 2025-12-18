import React, { useState } from 'react';
import { Task } from '../types';
import { Check, Plus, Search } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
}

const TasksView: React.FC<TaskBoardProps> = ({ tasks, onToggleStatus }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active') return task.status !== 'done' && matchesSearch;
    if (filter === 'done') return task.status === 'done' && matchesSearch;
    return matchesSearch;
  });

  const activeCount = tasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
          <button className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
            <Plus size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/5 border border-transparent focus:border-gray-200 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Все ({tasks.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Активные ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('done')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'done' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Готово ({doneCount})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Нет задач</h3>
            <p className="text-gray-400 text-sm">Создайте первую задачу</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => onToggleStatus(task.id)}
                className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-gray-300 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors flex-shrink-0 ${
                  task.status === 'done' ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'
                }`}>
                  {task.status === 'done' && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                   <span className={`text-base ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 font-medium'}`}>
                    {task.title}
                  </span>
                </div>
                {task.priority === 'high' && <div className="w-2 h-2 rounded-full bg-red-400 ml-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;