
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Task, CalendarEvent, ChatMessage, ChatSession, Note, ToastMessage, MarketBriefing } from './types';
import HomeView from './components/HomeView';
import TasksView from './components/TaskBoard';
import CalendarView from './components/CalendarView';
import ChatInterface from './components/ChatInterface';
import NotesView from './components/NotesView';
import SettingsView from './components/SettingsView';
import BottomNavigation from './components/BottomNavigation';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import OnboardingModal from './components/OnboardingModal';
import { getGeminiClient, modelConfig, fileToGenerativePart, generateImage, hasValidKey, generateDailyBriefing, generateDetailedMarketAnalysis } from './services/ai';
import { FunctionCall, Chat, Content } from "@google/genai";
import { supabase } from './services/supabase';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Проверить отчетность за 3 квартал', description: 'Сверить баланс, проверить поступления от контрагентов.', status: 'todo', priority: 'high' },
  { id: '2', title: 'Обновить лендинг сайта', description: 'Добавить блок с отзывами и обновить цены.', status: 'in-progress', priority: 'medium' },
];

function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [user, setUser] = useState<any>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isInitialPullDone = useRef(false);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('bizmate_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch { return INITIAL_TASKS; }
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('bizmate_events');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('bizmate_notes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('bizmate_chat_sessions');
      return saved ? JSON.parse(saved, (key, value) => (key === 'timestamp' || key === 'updatedAt') ? new Date(value) : value) : [{ id: Date.now().toString(), title: 'Новый чат', messages: [], updatedAt: new Date() }];
    } catch { return [{ id: Date.now().toString(), title: 'Новый чат', messages: [], updatedAt: new Date() }]; }
  });

  const [briefing, setBriefing] = useState<MarketBriefing>(() => {
    try {
      const saved = localStorage.getItem('bizmate_market_briefing');
      return saved ? JSON.parse(saved) : { sector: '', content: '', lastUpdated: '' };
    } catch { return { sector: '', content: '', lastUpdated: '' }; }
  });

  const [detailedReport, setDetailedReport] = useState<string | null>(() => {
    return localStorage.getItem('bizmate_detailed_report_content');
  });
  
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    try { return (localStorage.getItem('bizmate_theme') as 'light'|'dark') || 'light'; } catch { return 'light'; }
  });
  const [isSimMode, setIsSimMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast = { id: Date.now().toString(), message, type };
    setToasts(prev => [...prev, newToast]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // УЛЬТРА-БЛОКИРОВКА ESC
  useEffect(() => {
    const handleKeyInterception = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // 1. Пытаемся заблокировать системную клавишу Escape (Keyboard Lock API)
    // Это работает в Chromium браузерах, если приложение в полноэкранном режиме
    if ('keyboard' in navigator && (navigator as any).keyboard.lock) {
      (navigator as any).keyboard.lock(['Escape']).catch((err: any) => {
        console.debug('Keyboard lock not active (requires fullscreen or user interaction)');
      });
    }

    // 2. Слушаем на всех уровнях в фазе захвата
    window.addEventListener('keydown', handleKeyInterception, true);
    window.addEventListener('keyup', handleKeyInterception, true);
    document.addEventListener('keydown', handleKeyInterception, true);

    return () => {
      window.removeEventListener('keydown', handleKeyInterception, true);
      window.removeEventListener('keyup', handleKeyInterception, true);
      document.removeEventListener('keydown', handleKeyInterception, true);
    };
  }, []);

  const pullFromCloud = useCallback(async (userId: string) => {
    setIsSyncing(true);
    try {
      const [tRes, eRes, nRes, sRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId),
        supabase.from('events').select('*').eq('user_id', userId),
        supabase.from('notes').select('*').eq('user_id', userId),
        supabase.from('chat_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      ]);

      if (tRes.data && tRes.data.length > 0) setTasks(tRes.data as any);
      if (eRes.data && eRes.data.length > 0) setEvents(eRes.data as any);
      if (nRes.data && nRes.data.length > 0) setNotes(nRes.data as any);
      if (sRes.data && sRes.data.length > 0) {
        setSessions(sRes.data.map(s => ({
          id: s.id,
          title: s.title,
          messages: s.messages || [],
          updatedAt: new Date(s.updated_at)
        })));
      }
      
      isInitialPullDone.current = true;
    } catch (e) {
      console.error("[Supabase Pull Error]", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const pushToCloud = useCallback(async () => {
    if (!user || !isInitialPullDone.current) return;
    setIsSyncing(true);
    try {
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', user.id).then(() => tasks.length > 0 && supabase.from('tasks').insert(tasks.map(t => ({ ...t, id: undefined, user_id: user.id })))),
        supabase.from('events').delete().eq('user_id', user.id).then(() => events.length > 0 && supabase.from('events').insert(events.map(e => ({ ...e, id: undefined, user_id: user.id })))),
        supabase.from('notes').delete().eq('user_id', user.id).then(() => notes.length > 0 && supabase.from('notes').insert(notes.map(n => ({ ...n, id: undefined, user_id: user.id })))),
        supabase.from('chat_sessions').delete().eq('user_id', user.id).then(() => sessions.length > 0 && supabase.from('chat_sessions').insert(sessions.map(s => ({ id: s.id, user_id: user.id, title: s.title, messages: s.messages, updated_at: s.updatedAt }))))
      ]);
    } catch (e) {
      console.error("[Supabase Push Error]", e);
    } finally {
      setIsSyncing(false);
    }
  }, [user, tasks, events, notes, sessions]);

  useEffect(() => {
    const timer = setTimeout(() => { if (user && isInitialPullDone.current) pushToCloud(); }, 3000);
    return () => clearTimeout(timer);
  }, [tasks, events, notes, sessions, user, pushToCloud]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await pullFromCloud(session.user.id);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser && !isInitialPullDone.current) {
        await pullFromCloud(newUser.id);
      } else if (!newUser) {
        isInitialPullDone.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, [pullFromCloud]);

  useEffect(() => {
    hasValidKey().then(valid => {
      if (valid) setIsOnboardingOpen(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('bizmate_tasks', JSON.stringify(tasks));
    localStorage.setItem('bizmate_events', JSON.stringify(events));
    localStorage.setItem('bizmate_notes', JSON.stringify(notes));
    localStorage.setItem('bizmate_chat_sessions', JSON.stringify(sessions));
    localStorage.setItem('bizmate_market_briefing', JSON.stringify(briefing));
    localStorage.setItem('bizmate_theme', theme);
    if (detailedReport) {
      localStorage.setItem('bizmate_detailed_report_content', detailedReport);
    } else {
      localStorage.removeItem('bizmate_detailed_report_content');
    }
  }, [tasks, events, notes, sessions, theme, briefing, detailedReport]);

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const handleToolCalls = async (calls: FunctionCall[]) => {
    const responses = [];
    for (const call of calls) {
      const { name, args } = call;
      let result: any = { success: true };
      
      if (name === 'addTask') {
        setTasks(prev => [{ id: Date.now().toString(), title: args.title as string, description: args.description as string || '', status: 'todo', priority: (args.priority as any) || 'medium' }, ...prev]);
        showToast('Ассистент добавил задачу');
      } else if (name === 'addEvent') {
        const dateStr = args.date as string;
        const timeStr = (args.time as string) || '12:00';
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const localDate = new Date(year, month - 1, day, hours, minutes);

        setEvents(prev => [...prev, { 
          id: Date.now().toString(), 
          title: args.title as string, 
          date: localDate.toISOString(), 
          description: args.description as string || '', 
          priority: (args.priority as any) || 'medium' 
        }]);
        showToast('Событие добавлено в календарь');
      } else if (name === 'addNote') {
        setNotes(prev => [{ id: Date.now().toString(), title: args.title as string, content: args.content as string, date: new Date().toISOString() }, ...prev]);
        showToast('Заметка создана');
      } else if (name === 'generateImage') {
        const img = await generateImage(args.prompt as string);
        if (img) {
          const msg: ChatMessage = { id: Date.now().toString(), role: 'model', content: 'Картинка готова!', timestamp: new Date(), image: img };
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, msg] } : s));
        }
      }
      responses.push({ name, response: { result }, id: call.id });
    }
    return responses;
  };

  const handleSetSector = async (sector: string) => {
    setIsBriefingLoading(true);
    setDetailedReport(null); 
    try {
      const content = await generateDailyBriefing(sector);
      setBriefing({ sector, content, lastUpdated: new Date().toISOString() });
      showToast('Аналитика обновлена');
    } catch (e) {
      showToast('Ошибка аналитики', 'error');
    } finally { setIsBriefingLoading(false); }
  };

  const handleGenerateDetailedReport = async (sector: string) => {
    try {
      const report = await generateDetailedMarketAnalysis(sector);
      setDetailedReport(report);
      return report;
    } catch (e) {
      showToast('Ошибка отчета', 'error');
      return '';
    }
  };

  useEffect(() => {
    if (isOnboardingOpen) return;
    try {
      const client = getGeminiClient();
      const current = sessions.find(s => s.id === activeSessionId);
      const history: Content[] = (current?.messages || []).map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      
      let extendedSystemInstruction = (modelConfig.config.systemInstruction || '') + 
        `\n\nТЕКУЩЕЕ ВРЕМЯ: ${new Date().toLocaleString('ru-RU')}. 
        ЗАДАЧИ: ${JSON.stringify(tasks)}. 
        СОБЫТИЯ: ${JSON.stringify(events)}. 
        ЗАМЕТКИ: ${JSON.stringify(notes)}`;
      
      if (detailedReport) {
        extendedSystemInstruction += `\n\nТЕКУЩИЙ ГЛУБОКИЙ АНАЛИЗ РЫНКА (Сектор: ${briefing.sector}):\n${detailedReport}\n\nТы ОБЯЗАН использовать данные этого глубокого отчета при ответах пользователю, опираться на его выводы и помогать внедрять описанные там стратегии.`;
      }
      
      setChatSession(client.chats.create({ 
        ...modelConfig, 
        history, 
        config: { 
          ...modelConfig.config, 
          systemInstruction: extendedSystemInstruction
        } 
      }));
    } catch (e) {
      console.warn("Client initialization deferred until API key is provided");
    }
  }, [activeSessionId, isOnboardingOpen, tasks.length, events.length, notes.length, user, detailedReport, briefing.sector]);

  const handleSendMessage = async (text: string, file: File | null) => {
    if (!chatSession || isProcessing) return;
    setIsProcessing(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date(), attachmentName: file?.name };
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg], updatedAt: new Date() } : s));
    
    try {
      const parts: any[] = [{ text }];
      if (file) parts.unshift(await fileToGenerativePart(file));
      
      let response = await chatSession.sendMessage({ message: parts });
      let functionCalls = response.functionCalls;

      while (functionCalls && functionCalls.length > 0) {
        const toolResponses = await handleToolCalls(functionCalls);
        const toolParts = toolResponses.map(r => ({ functionResponse: { name: r.name, response: r.response, id: r.id } }));
        response = await chatSession.sendMessage({ message: toolParts });
        functionCalls = response.functionCalls;
      }

      const botMsg: ChatMessage = { 
        id: (Date.now()+1).toString(), 
        role: 'model', 
        content: response.text || "Готово", 
        timestamp: new Date(), 
        groundingMetadata: response.candidates?.[0]?.groundingMetadata 
      };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, botMsg], updatedAt: new Date() } : s));
    } catch (e: any) {
      showToast('Ошибка ассистента', 'error');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className={`flex h-[100dvh] ${theme === 'dark' ? 'dark' : ''} bg-white dark:bg-[#191919] overflow-hidden transition-colors`}>
      {isOnboardingOpen && <OnboardingModal onComplete={() => setIsOnboardingOpen(false)} onEnableSimMode={() => setIsSimMode(true)} />}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} isSyncing={isSyncing} />
      <div className="flex-1 flex flex-col h-full relative">
        <main className="flex-1 overflow-hidden relative">
          {currentView === View.HOME && <HomeView tasks={tasks} events={events} onChangeView={setCurrentView} briefing={briefing} onSetSector={handleSetSector} isBriefingLoading={isBriefingLoading} detailedReport={detailedReport} onGenerateDetailedReport={handleGenerateDetailedReport} isSimMode={isSimMode} />}
          {currentView === View.TASKS && <TasksView tasks={tasks} onToggleStatus={id => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))} onAddTask={t => setTasks(prev => [{ ...t, id: Date.now().toString() }, ...prev])} onUpdateTask={t => setTasks(prev => prev.map(item => item.id === t.id ? t : item))} onDeleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))} />}
          {currentView === View.CALENDAR && <CalendarView events={events} onAddEvent={e => setEvents(prev => [...prev, { ...e, id: Date.now().toString() }])} onUpdateEvent={e => setEvents(prev => prev.map(item => item.id === e.id ? e : item))} onDeleteEvent={id => setEvents(prev => prev.filter(e => e.id !== id))} />}
          {currentView === View.NOTES && <NotesView notes={notes} onAddNote={n => setNotes(prev => [{ ...n, id: Date.now().toString(), date: new Date().toISOString() }, ...prev])} onUpdateNote={n => setNotes(prev => prev.map(item => item.id === n.id ? n : item))} onDeleteNote={id => setNotes(prev => prev.filter(n => n.id !== id))} />}
          {currentView === View.ASSISTANT && <ChatInterface messages={sessions.find(s => s.id === activeSessionId)?.messages || []} onSendMessage={handleSendMessage} isProcessing={isProcessing} sessions={sessions} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onNewSession={() => { const ns = { id: Date.now().toString(), title: 'Новый чат', messages: [], updatedAt: new Date() }; setSessions([ns, ...sessions]); setActiveSessionId(ns.id); }} onDeleteSession={id => setSessions(prev => prev.filter(s => s.id !== id))} />}
          {currentView === View.SETTINGS && <SettingsView theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onBack={() => setCurrentView(View.HOME)} onClearHistory={() => setSessions([{ id: Date.now().toString(), title: 'Новый чат', messages: [], updatedAt: new Date() }])} currentSector={briefing.sector} onUpdateSector={handleSetSector} isSimMode={isSimMode} onToggleSimMode={() => setIsSimMode(!isSimMode)} onRestore={(data) => {
            if (data['bizmate_tasks']) setTasks(data['bizmate_tasks']);
            if (data['bizmate_events']) setEvents(data['bizmate_events']);
            if (data['bizmate_notes']) setNotes(data['bizmate_notes']);
            if (data['bizmate_chat_sessions']) setSessions(data['bizmate_chat_sessions']);
            if (data['bizmate_market_briefing']) setBriefing(data['bizmate_market_briefing']);
          }} onShowToast={showToast} />}
        </main>
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
export default App;
