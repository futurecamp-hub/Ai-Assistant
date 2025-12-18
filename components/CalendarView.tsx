
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Plus, ChevronLeft, ChevronRight, X, Clock, Trash2 } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventPriority, setNewEventPriority] = useState<'low'|'medium'|'high'>('medium');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const selectedDay = currentDate.getDate();

  const getDayEvents = (day: number) => {
    return events.filter(e => {
       const d = new Date(e.date);
       return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  const selectedDateEvents = getDayEvents(selectedDay);

  const openModal = (event?: CalendarEvent) => {
    if (event) {
      // Edit Mode
      setEditingEventId(event.id);
      setNewEventTitle(event.title);
      setNewEventDesc(event.description || '');
      setNewEventPriority(event.priority || 'medium');
      
      const d = new Date(event.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const minute = String(d.getMinutes()).padStart(2, '0');

      setNewEventDate(`${year}-${month}-${day}`);
      setNewEventTime(`${hour}:${minute}`);
    } else {
      // New Mode
      setEditingEventId(null);
      // Format current selected date as YYYY-MM-DD for the input
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      
      setNewEventDate(`${year}-${month}-${day}`);
      setNewEventTitle('');
      setNewEventTime('12:00');
      setNewEventDesc('');
      setNewEventPriority('medium');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    // Combine date and time
    const finalDate = new Date(`${newEventDate}T${newEventTime}`);

    if (editingEventId && onUpdateEvent) {
      onUpdateEvent({
        id: editingEventId,
        title: newEventTitle,
        date: finalDate.toISOString(),
        description: newEventDesc,
        priority: newEventPriority
      });
    } else if (onAddEvent) {
      onAddEvent({
        title: newEventTitle,
        date: finalDate.toISOString(),
        description: newEventDesc,
        priority: newEventPriority
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingEventId && onDeleteEvent) {
      if(window.confirm('Удалить это событие?')) {
        onDeleteEvent(editingEventId);
        setIsModalOpen(false);
      }
    }
  };

  return (
    /* Changed structure: Single scrollable container for the whole view so calendar scrolls with list */
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#191919] overflow-y-auto transition-colors duration-200 pb-24 md:pb-6 relative">
      
      {/* Calendar Header & Grid - Now part of the scroll flow, not fixed */}
      <div className="bg-white dark:bg-[#202020] px-6 pt-12 pb-6 rounded-b-3xl shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Календарь</h1>
          <button 
            onClick={() => openModal()}
            className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-8 px-2 max-w-sm w-full mx-auto">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] rounded-full dark:text-gray-100"><ChevronLeft size={24} /></button>
          <h2 className="text-lg font-medium capitalize text-gray-900 dark:text-gray-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] rounded-full dark:text-gray-100"><ChevronRight size={24} /></button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-6 text-center mb-4 max-w-md mx-auto">
          {weekDays.map(d => (
            <div key={d} className="text-xs text-gray-400 uppercase font-medium">{d}</div>
          ))}
          
          {Array.from({ length: startOffset }).map((_, i) => (
             <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selectedDay;
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
            const dayEvents = getDayEvents(day);
            const hasEvents = dayEvents.length > 0;
            
            // Priority check
            const hasHighPriority = dayEvents.some(e => e.priority === 'high');
            const hasMediumPriority = dayEvents.some(e => e.priority === 'medium');

            return (
              <div key={day} className="flex flex-col items-center cursor-pointer group" onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(day);
                setCurrentDate(newDate);
              }}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isSelected ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 
                  isToday ? 'text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-900 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-[#2c2c2c]'
                }`}>
                  {day}
                </div>
                
                <div className="h-2 mt-1 flex items-center justify-center">
                  {hasEvents && (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      hasHighPriority ? 'bg-red-500' :
                      hasMediumPriority ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="px-6 py-6">
        <div className="max-w-2xl w-full mx-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 capitalize">
            {selectedDay} {monthNames[currentDate.getMonth()]}, {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString('ru-RU', { weekday: 'long' })}
            </h3>

            {selectedDateEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <p>Нет событий</p>
            </div>
            ) : (
            <div className="space-y-4">
                {selectedDateEvents.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => openModal(event)}
                  className="bg-white dark:bg-[#202020] p-4 rounded-2xl shadow-sm border-l-4 border-black dark:border-white hover:shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</div>
                      {event.priority && (
                         <div className={`text-xxs px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                            event.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            event.priority === 'low' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                         }`}>
                           {event.priority === 'high' ? 'Важно' : event.priority === 'low' ? 'Низкий' : 'Средний'}
                         </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description || 'Нет описания'}</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center">
                       <Clock size={12} className="mr-1" />
                       {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-[#2f2f2f] max-h-[90vh] overflow-y-auto">
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingEventId ? 'Редактировать событие' : 'Новое событие'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Что будет</label>
                     <input 
                       autoFocus
                       type="text" 
                       value={newEventTitle}
                       onChange={e => setNewEventTitle(e.target.value)}
                       placeholder="Например: Встреча с инвестором"
                       className="w-full bg-gray-50 dark:bg-[#2c2c2c] border-transparent focus:bg-white dark:focus:bg-[#191919] focus:border-black dark:focus:border-gray-500 rounded-xl px-4 py-3 outline-none transition-all dark:text-white"
                       required
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Дата</label>
                        <input 
                          type="date" 
                          value={newEventDate}
                          onChange={e => setNewEventDate(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-[#2c2c2c] border-transparent focus:bg-white dark:focus:bg-[#191919] focus:border-black dark:focus:border-gray-500 rounded-xl px-4 py-3 outline-none transition-all dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Время</label>
                        <input 
                          type="time" 
                          value={newEventTime}
                          onChange={e => setNewEventTime(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-[#2c2c2c] border-transparent focus:bg-white dark:focus:bg-[#191919] focus:border-black dark:focus:border-gray-500 rounded-xl px-4 py-3 outline-none transition-all dark:text-white"
                          required
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Приоритет</label>
                      <div className="flex space-x-2">
                        {(['low', 'medium', 'high'] as const).map((p) => (
                           <button
                             key={p}
                             type="button"
                             onClick={() => setNewEventPriority(p)}
                             className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                               newEventPriority === p 
                                 ? p === 'high' ? 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300'
                                 : p === 'medium' ? 'bg-yellow-100 border-yellow-200 text-yellow-700 dark:bg-yellow-900/40 dark:border-yellow-800 dark:text-yellow-300'
                                 : 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300'
                                 : 'bg-white dark:bg-[#2c2c2c] border-gray-200 dark:border-[#3c3c3c] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#363636]'
                             }`}
                           >
                             {p === 'high' ? 'Важно' : p === 'medium' ? 'Средне' : 'Не горит'}
                           </button>
                        ))}
                      </div>
                   </div>

                   <div>
                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Детали (Опционально)</label>
                     <textarea 
                       value={newEventDesc}
                       onChange={e => setNewEventDesc(e.target.value)}
                       placeholder="Дополнительная информация..."
                       rows={3}
                       className="w-full bg-gray-50 dark:bg-[#2c2c2c] border-transparent focus:bg-white dark:focus:bg-[#191919] focus:border-black dark:focus:border-gray-500 rounded-xl px-4 py-3 outline-none transition-all resize-none dark:text-white"
                     />
                   </div>

                   <div className="flex space-x-3 pt-2">
                     {editingEventId && onDeleteEvent && (
                        <button 
                          type="button"
                          onClick={handleDelete}
                          className="p-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                     )}
                     <button 
                       type="submit" 
                       className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                     >
                       {editingEventId ? 'Сохранить изменения' : 'Добавить событие'}
                     </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
