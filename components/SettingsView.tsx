
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, ArrowLeft, Key, Database, Download, Upload, Cloud, LogIn, Loader2, LogOut, CloudDownload, CloudUpload, ExternalLink, ShieldCheck, Mail, Lock } from 'lucide-react';
import { getStorageUsage, formatBytes, exportWorkspace, parseBackupFile } from '../services/storageManager';
import { supabase } from '../services/supabase';
import { openApiKeySelector } from '../services/ai';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onBack: () => void;
  onClearHistory: () => void;
  currentSector: string;
  onUpdateSector: (sector: string) => void;
  isSimMode: boolean;
  onToggleSimMode: () => void;
  onRestore: (data: Record<string, any>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  theme, 
  toggleTheme, 
  onBack, 
  onClearHistory,
  currentSector,
  onUpdateSector,
  isSimMode,
  onToggleSimMode,
  onRestore,
  onShowToast
}) => {
  const [storageUsed, setStorageUsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const LIMIT = 5 * 1024 * 1024;

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pushing' | 'pulling' | 'success' | 'error'>('idle');

  useEffect(() => {
    setStorageUsed(getStorageUsage());
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setAuthLoading(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
        if (error) {
            // Try sign up if login fails (simple dev flow)
            const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });
            if (signUpError) onShowToast(`Ошибка: ${signUpError.message}`, 'error');
            else onShowToast("Аккаунт создан! Проверьте почту или войдите.", 'success');
        } else {
            onShowToast("Успешный вход!", 'success');
        }
    } catch (err: any) {
        onShowToast(`Ошибка: ${err.message}`, 'error');
    } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    onShowToast("Вышли из системы", "info");
  };

  const handlePushToCloud = async () => {
    if (!user) return;
    setSyncStatus('pushing');
    try {
        const localTasks = JSON.parse(localStorage.getItem('bizmate_tasks') || '[]');
        const localEvents = JSON.parse(localStorage.getItem('bizmate_events') || '[]');
        const localNotes = JSON.parse(localStorage.getItem('bizmate_notes') || '[]');
        const localSessions = JSON.parse(localStorage.getItem('bizmate_chat_sessions') || '[]');

        await supabase.from('tasks').delete().eq('user_id', user.id);
        if (localTasks.length > 0) await supabase.from('tasks').insert(localTasks.map((t: any) => ({ ...t, id: undefined, user_id: user.id })));
        
        await supabase.from('events').delete().eq('user_id', user.id);
        if (localEvents.length > 0) await supabase.from('events').insert(localEvents.map((e: any) => ({ ...e, id: undefined, user_id: user.id })));
        
        await supabase.from('notes').delete().eq('user_id', user.id);
        if (localNotes.length > 0) await supabase.from('notes').insert(localNotes.map((n: any) => ({ ...n, id: undefined, user_id: user.id })));

        setSyncStatus('success');
        onShowToast('Синхронизировано', 'success');
        setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
        onShowToast('Ошибка синхронизации', 'error');
        setSyncStatus('error');
    }
  };

  const usagePercent = Math.min((storageUsed / LIMIT) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919] transition-colors duration-200">
      <div className="px-6 pt-12 pb-6 border-b border-gray-100 dark:border-[#2f2f2f]">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-600 dark:text-gray-400"><ArrowLeft size={24} /></button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Настройки</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
        <div className="max-w-2xl space-y-8 mx-auto">
          
          {/* CLOUD SYNC SECTION */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Облако (Supabase)</h2>
            <div className="bg-gray-50 dark:bg-[#202020] rounded-3xl p-6 border border-gray-100 dark:border-[#2f2f2f] shadow-sm">
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                        <Cloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Подключено</p>
                        <p className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                      <LogOut size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handlePushToCloud}
                      disabled={syncStatus === 'pushing'}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                    >
                      {syncStatus === 'pushing' ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                      <span>Синхронизировать сейчас</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2f2f2f] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        placeholder="Пароль" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#2f2f2f] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                    <span>Войти в облако</span>
                  </button>
                  <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Синхронизируйте ваши данные между устройствами</p>
                </form>
              )}
            </div>
          </section>

          {/* API KEY SECTION */}
          <section>
             <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Интеллект (AI)</h2>
             <div className="bg-gray-50 dark:bg-[#202020] rounded-3xl p-6 border border-gray-100 dark:border-[#2f2f2f] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl">
                         <Key size={20} />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-gray-100">API Ключ Gemini</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Настройка доступа к моделям</p>
                      </div>
                   </div>
                   <button 
                      onClick={openApiKeySelector}
                      className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md"
                   >
                      ПОДКЛЮЧИТЬ
                   </button>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-[#2f2f2f]">
                   <a 
                     href="https://aistudio.google.com/app/apikey" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center hover:underline font-black uppercase tracking-widest"
                   >
                     ПОЛУЧИТЬ КЛЮЧ В GOOGLE AI STUDIO <ExternalLink size={10} className="ml-1.5" />
                   </a>
                </div>
             </div>
          </section>

          <section>
             <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Внешний вид</h2>
             <div className="bg-gray-50 dark:bg-[#202020] rounded-3xl p-6 border border-gray-100 dark:border-[#2f2f2f] flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                   <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">Тёмная тема</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Комфортная работа вечером</p>
                   </div>
                </div>
                <button 
                   onClick={toggleTheme}
                   className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                   <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Локальное хранилище</h2>
            <div className="bg-gray-50 dark:bg-[#202020] rounded-3xl p-6 border border-gray-100 dark:border-[#2f2f2f] shadow-sm">
               <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 dark:text-gray-300">
                  <span>ИСПОЛЬЗОВАНО: {formatBytes(storageUsed)}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{Math.round(usagePercent)}%</span>
               </div>
               <div className="w-full bg-gray-200 dark:bg-[#333] rounded-full h-2.5 mb-8 overflow-hidden">
                 <div className="bg-black dark:bg-indigo-500 h-full transition-all" style={{ width: `${usagePercent}%` }}></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <button onClick={exportWorkspace} className="flex items-center justify-center space-x-2 bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3c3c3c] py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#333] transition-colors text-gray-900 dark:text-gray-100 shadow-sm font-black text-xs uppercase tracking-widest">
                     <Download size={16} /><span>Экспорт</span>
                   </button>
                   <label className="flex items-center justify-center space-x-2 bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3c3c3c] py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#333] transition-colors cursor-pointer text-gray-900 dark:text-gray-100 shadow-sm font-black text-xs uppercase tracking-widest">
                     <Upload size={16} /><span>Импорт</span>
                     <input type="file" ref={fileInputRef} onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (!file) return;
                       try {
                         const data = await parseBackupFile(file);
                         onRestore(data);
                         onShowToast('Данные восстановлены', 'success');
                       } catch { onShowToast('Ошибка импорта', 'error'); }
                     }} accept=".json" className="hidden" />
                   </label>
               </div>
            </div>
          </section>

          <div className="pt-4 flex flex-col items-center">
             <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 mb-2">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure. Private. Local.</span>
             </div>
             <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-black tracking-widest">BizMate AI Workspace v2.8</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
