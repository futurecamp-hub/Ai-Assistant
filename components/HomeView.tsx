
import React, { useState, useMemo } from 'react';
import { Plus, Calendar as CalendarIcon, Activity, Settings, TrendingUp, Loader2, ArrowRight, X, Maximize2, Zap, AlertTriangle, CheckCircle2, ListTodo, Globe, Sparkles, Pencil } from 'lucide-react';
import { Task, CalendarEvent, View, MarketBriefing } from '../types';
import ReactMarkdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HomeViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  onChangeView: (view: View) => void;
  briefing: MarketBriefing;
  onSetSector: (sector: string) => void;
  isBriefingLoading: boolean;
  detailedReport: string | null;
  onGenerateDetailedReport: (sector: string) => Promise<string>;
  isSimMode: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  tasks, 
  events, 
  onChangeView, 
  briefing, 
  onSetSector, 
  isBriefingLoading,
  detailedReport,
  onGenerateDetailedReport,
  isSimMode
}) => {
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const productivityData = useMemo(() => [
    { name: 'Пн', tasks: Math.max(2, completedTasks - 5) },
    { name: 'Вт', tasks: Math.max(3, completedTasks - 3) },
    { name: 'Ср', tasks: Math.max(1, completedTasks - 6) },
    { name: 'Чт', tasks: Math.max(4, completedTasks - 2) },
    { name: 'Пт', tasks: completedTasks },
    { name: 'Сб', tasks: Math.floor(completedTasks / 2) },
    { name: 'Вс', tasks: Math.floor(completedTasks / 3) },
  ], [completedTasks]);

  const now = new Date();
  const todaysEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getDate() === now.getDate() &&
           eventDate.getMonth() === now.getMonth() &&
           eventDate.getFullYear() === now.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const [sectorInput, setSectorInput] = useState(briefing.sector || '');
  const [isEditingSector, setIsEditingSector] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectorInput.trim()) {
      onSetSector(sectorInput.trim());
      setIsEditingSector(false);
    }
  };

  const handleShowDetailedReport = async () => {
    setIsDetailModalOpen(true);
    if (detailedReport) return;

    setIsDetailLoading(true);
    try {
      await onGenerateDetailedReport(briefing.sector);
    } catch (e) {
      // Error handling managed upstream
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#191919] overflow-y-auto pb-24 md:pb-6 transition-colors duration-200">
      
      {isSimMode && (
         <div className="bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-xs font-medium">
            <div className="flex items-center space-x-2">
               <Zap size={14} className="text-yellow-400" />
               <span>DEMO MODE ACTIVE</span>
            </div>
            <button onClick={() => onChangeView(View.SETTINGS)} className="hover:text-gray-300">Настроить API</button>
         </div>
      )}

      <div className="px-6 pt-8 pb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">Панель управления</h1>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => onChangeView(View.SETTINGS)}
            className="p-2.5 rounded-xl bg-white dark:bg-[#2c2c2c] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3c3c3c] transition-all shadow-sm border border-gray-100 dark:border-[#2f2f2f]"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-6 max-w-7xl w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Productivity Card */}
           <div className="bg-white dark:bg-[#202020] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2f2f2f] flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                 <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Продуктивность</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{progress}%</div>
                 </div>
                 <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                    <CheckCircle2 size={20} />
                 </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 z-0 opacity-50">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <defs>
                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="z-10 text-xs text-gray-400 dark:text-gray-500 mt-2 font-bold uppercase">
                 {completedTasks} из {totalTasks} задач
              </div>
           </div>

           {/* Quick Start Card */}
           <div className="bg-white dark:bg-[#202020] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2f2f2f] flex flex-col justify-between h-48">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-gray-900 dark:text-gray-100 text-xs font-bold uppercase tracking-wider">Быстрый старт</h3>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                       Управляйте рабочим временем эффективно.
                    </p>
                 </div>
                 <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                    <Zap size={20} />
                 </div>
              </div>
              <div className="flex gap-3 mt-4">
                 <button onClick={() => onChangeView(View.TASKS)} className="flex-1 bg-gray-50 dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3c3c3c] hover:bg-gray-100 dark:hover:bg-[#363636] text-gray-900 dark:text-gray-100 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-sm">
                   <Plus size={16} className="mr-1.5" /> Задача
                 </button>
                 <button onClick={() => onChangeView(View.CALENDAR)} className="flex-1 bg-gray-50 dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3c3c3c] hover:bg-gray-100 dark:hover:bg-[#363636] text-gray-900 dark:text-gray-100 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-sm">
                   <CalendarIcon size={16} className="mr-1.5" /> Встреча
                 </button>
              </div>
           </div>

           {/* Agenda Card */}
           <div className="bg-white dark:bg-[#202020] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2f2f2f] flex flex-col h-48">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Сегодня</h3>
                 <span className="text-xs bg-gray-100 dark:bg-[#333] px-2 py-0.5 rounded font-bold text-gray-600 dark:text-gray-300">{todaysEvents.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                 {todaysEvents.length > 0 ? todaysEvents.map(e => (
                    <div key={e.id} className="flex items-center text-sm p-2.5 bg-gray-50 dark:bg-[#252525] rounded-xl border-l-4 border-indigo-500 shadow-sm transition-transform active:scale-[0.98]">
                       <span className="text-[10px] font-bold font-mono text-gray-400 mr-2">{new Date(e.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       <span className="truncate font-bold text-gray-800 dark:text-gray-100">{e.title}</span>
                    </div>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic">
                       Событий нет
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Market News Section */}
           <div className="lg:col-span-2 flex flex-col">
              <div className="bg-white dark:bg-[#202020] border border-gray-100 dark:border-[#2f2f2f] rounded-2xl shadow-sm flex flex-col h-full min-h-[460px]">
                 <div className="p-5 border-b border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Globe size={18} />
                       </div>
                       <h2 className="font-bold text-gray-900 dark:text-gray-100">Бизнес-разведка (РФ)</h2>
                    </div>
                    {briefing.sector && !isEditingSector && (
                        <div className="flex items-center space-x-2">
                           <button 
                              onClick={() => setIsEditingSector(true)}
                              className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1.5 transition-all uppercase tracking-widest"
                           >
                              {briefing.sector}
                              <Pencil size={12} />
                           </button>
                        </div>
                    )}
                 </div>
                 
                 <div className="p-6 flex-1 relative overflow-hidden bg-white dark:bg-[#202020]">
                    {(!briefing.sector || isEditingSector) ? (
                       <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                          <Activity size={48} className="text-gray-200 dark:text-gray-700 mb-4" />
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{isEditingSector ? 'Смена сферы' : 'Настройка разведки'}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">Укажите вашу бизнес-нишу для получения актуальной аналитики от Джарвиса.</p>
                          <form onSubmit={handleSaveSector} className="w-full flex gap-2">
                             <input 
                               autoFocus
                               value={sectorInput}
                               onChange={(e) => setSectorInput(e.target.value)}
                               placeholder="Например: Недвижимость..."
                               className="flex-1 bg-gray-50 dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3c3c3c] rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:text-white transition-all shadow-inner"
                             />
                             <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg">ОК</button>
                             {isEditingSector && (
                                <button type="button" onClick={() => { setIsEditingSector(false); setSectorInput(briefing.sector); }} className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><X size={20} /></button>
                             )}
                          </form>
                       </div>
                    ) : (
                       <div className="h-full flex flex-col">
                          {isBriefingLoading ? (
                             <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="animate-spin text-indigo-500" size={32} />
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Анализирую новости...</span>
                             </div>
                          ) : (
                             <>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                   <div className="notion-content prose prose-sm dark:prose-invert max-w-none 
                                     prose-headings:text-gray-900 dark:prose-headings:text-gray-100 
                                     prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-p:font-medium
                                     prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black">
                                      <ReactMarkdown>{briefing.content}</ReactMarkdown>
                                   </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center">
                                   <span className="text-[10px] text-gray-400 font-bold italic uppercase tracking-tighter">Обновлено: {new Date(briefing.lastUpdated).toLocaleTimeString()}</span>
                                   <button 
                                      onClick={handleShowDetailedReport}
                                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:opacity-80 flex items-center transition-all bg-indigo-50 dark:bg-indigo-900/20 px-5 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm"
                                   >
                                      ПОДРОБНЫЙ ОТЧЕТ <ArrowRight size={14} className="ml-2" />
                                   </button>
                                </div>
                             </>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Tasks Summary */}
           <div className="flex flex-col">
              <div className="bg-white dark:bg-[#202020] border border-gray-100 dark:border-[#2f2f2f] rounded-2xl shadow-sm flex flex-col h-full min-h-[460px]">
                 <div className="p-5 border-b border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                          <ListTodo size={18} />
                       </div>
                       <h2 className="font-bold text-gray-900 dark:text-gray-100">Задачи</h2>
                    </div>
                    <button onClick={() => onChangeView(View.TASKS)} className="text-[10px] text-gray-400 font-black hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">ОТКРЫТЬ</button>
                 </div>
                 
                 <div className="p-3 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#202020]">
                    {activeTasks.length > 0 ? (
                       <div className="space-y-2.5">
                          {activeTasks.slice(0, 7).map(t => (
                             <div key={t.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#252525] border border-transparent hover:border-gray-200 dark:hover:border-[#3c3c3c] group transition-all cursor-pointer shadow-sm active:scale-[0.98]" onClick={() => onChangeView(View.TASKS)}>
                                <div className="flex items-start justify-between">
                                   <span className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{t.title}</span>
                                   <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                      t.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                      t.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'
                                   }`} />
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2">
                          <CheckCircle2 size={32} />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Всё выполнено</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* Detailed Intelligence Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)} />
          <div className="bg-white dark:bg-[#121212] w-full max-w-4xl h-full max-h-[94vh] rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col overflow-hidden border border-gray-100 dark:border-[#2f2f2f]">
             
             <div className="p-6 border-b border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center bg-white dark:bg-[#121212] z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                   <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                     <Activity size={24} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">Разведка J.A.R.V.I.S.</h3>
                     <p className="text-[11px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.3em] mt-2">{briefing.sector} • Глубокий отчет</p>
                   </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2.5 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] rounded-xl transition-all shadow-inner">
                  <X size={28} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] px-6 py-10 md:px-16 md:py-16 custom-scrollbar">
                {isDetailLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-10">
                    <div className="relative">
                       <Loader2 className="animate-spin text-indigo-500" size={72} />
                       <Sparkles size={28} className="absolute -top-3 -right-3 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="text-center max-w-md">
                       <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Изучаю рыночные сдвиги...</h4>
                       <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                         Я анализирую данные РФ, конкурентов и глобальные тренды для вашего бизнеса.
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="notion-detailed-report prose prose-lg dark:prose-invert max-w-none 
                    prose-h1:text-4xl prose-h1:font-black prose-h1:mb-10 prose-h1:border-b prose-h1:pb-6 prose-h1:text-gray-900 dark:prose-h1:text-white
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:text-gray-900 dark:prose-h2:text-gray-100
                    prose-p:leading-loose prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-p:font-medium prose-p:mb-6
                    prose-ul:space-y-4 prose-li:text-gray-700 dark:prose-li:text-gray-200 prose-li:font-medium
                    prose-strong:text-gray-900 dark:prose-strong:text-indigo-400 prose-strong:font-black
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-[#202020] prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200
                  ">
                     <ReactMarkdown>{detailedReport || "Нет данных."}</ReactMarkdown>
                  </div>
                )}
             </div>
             
             {!isDetailLoading && (
                <div className="p-5 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-[#2f2f2f] flex justify-center">
                   <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.4em]">ОТЧЕТ СФОРМИРОВАН В РЕЖИМЕ РЕАЛЬНОГО ВРЕМЕНИ</p>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
