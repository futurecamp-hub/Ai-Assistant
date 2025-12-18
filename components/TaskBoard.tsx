
import React, { useState } from 'react';
import { Task } from '../types';
import { Check, Plus, Search, X, Trash2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TasksView: React.FC<TaskBoardProps> = ({ 
  tasks, 
  onToggleStatus,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low'|'medium'|'high'>('medium');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'active') return task.status !== 'done' && matchesSearch;
    if (filter === 'done') return task.status === 'done' && matchesSearch;
    return matchesSearch;
  });

  const activeCount = tasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTaskId(task.id);
      setTaskTitle(task.title);
      setTaskDescription(task.description || '');
      setTaskPriority(task.priority);
    } else {
      setEditingTaskId(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    if (editingTaskId) {
      onUpdateTask({ id: editingTaskId, title: taskTitle.trim(), description: taskDescription.trim(), status: tasks.find(t=>t.id===editingTaskId)?.status || 'todo', priority: taskPriority });
    } else {
      onAddTask({ title: taskTitle.trim(), description: taskDescription.trim(), status: 'todo', priority: taskPriority });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919] transition-colors duration-200">
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Задачи</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => handleOpenModal()} className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-sm hover:opacity-90 transition-opacity"><Plus size={24} /></button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Поиск задач..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-100 dark:bg-[#2c2c2c] rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-gray-900 dark:text-white" />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-500'}`}>Все ({tasks.length})</button>
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'active' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-500'}`}>Активные ({activeCount})</button>
          <button onClick={() => setFilter('done')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'done' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-500'}`}>Готово ({doneCount})</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-6 space-y-3">
        {filteredTasks.map(task => (
          <div key={task.id} onClick={() => handleOpenModal(task)} className="group flex items-center p-4 rounded-xl border border-gray-100 dark:border-[#2f2f2f] bg-white dark:bg-[#202020] shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${task.status === 'done' ? 'bg-black dark:bg-white border-black dark:border-white' : 'border-gray-300 shadow-inner'}`}>
              {task.status === 'done' && <Check size={14} className="text-white dark:text-black" />}
            </div>
            <div className="flex-1">
               <span className={`text-base ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                  {task.title}
               </span>
            </div>
            
            {/* PRIORITY INDICATOR (IMPORTANCE) */}
            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${
               task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
               task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'
            }`} title={`Приоритет: ${task.priority}`} />
            
            <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-3xl shadow-2xl relative p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">{editingTaskId ? 'Редактировать' : 'Новая задача'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-1"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-5">
                <input autoFocus type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Что нужно сделать?" className="w-full bg-gray-50 dark:bg-[#2c2c2c] rounded-xl px-4 py-3 outline-none dark:text-white border border-transparent focus:border-black dark:focus:border-white transition-all" required />
                
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">Приоритет</label>
                  <div className="flex space-x-2">
                     {(['low', 'medium', 'high'] as const).map(p => (
                       <button 
                         key={p} 
                         type="button" 
                         onClick={() => setTaskPriority(p)}
                         className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            taskPriority === p 
                              ? p === 'high' ? 'bg-red-500 border-red-500 text-white shadow-md' : p === 'medium' ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-green-500 border-green-500 text-white'
                              : 'bg-white dark:bg-[#2c2c2c] border-gray-100 dark:border-[#3c3c3c] text-gray-500'
                         }`}
                       >
                         {p === 'high' ? 'ВАЖНО' : p === 'medium' ? 'СРЕДНЕ' : 'НИЗКИЙ'}
                       </button>
                     ))}
                  </div>
                </div>

                <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} placeholder="Заметки..." className="w-full bg-gray-50 dark:bg-[#2c2c2c] rounded-xl px-4 py-3 outline-none dark:text-white h-24 resize-none" />
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">Готово</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksView;
