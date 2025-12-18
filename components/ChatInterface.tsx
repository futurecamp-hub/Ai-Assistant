
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { ArrowUp, Paperclip, Loader2, Sparkles, X, Plus, Trash2, Menu, Clock, PanelLeft, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, file: File | null) => Promise<void>;
  isProcessing: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isProcessing,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !file) || isProcessing) return;
    const currentInput = input;
    const currentFile = file;
    setInput('');
    setFile(null);
    await onSendMessage(currentInput, currentFile);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#191919] relative transition-colors duration-200">
      
      {/* Sessions Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-gray-50 dark:bg-[#202020] border-r border-gray-100 dark:border-[#2f2f2f] transform transition-all duration-300 ease-in-out 
        md:relative md:translate-x-0
        ${showHistory ? 'translate-x-0' : '-translate-x-full'}
        ${desktopSidebarOpen ? 'md:w-64' : 'md:w-0 md:border-r-0 md:overflow-hidden'}
        flex flex-col h-full w-64 flex-shrink-0
      `}>
         <div className="p-4 border-b border-gray-200 dark:border-[#2f2f2f] flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate text-xs uppercase tracking-wider">
              <Clock size={16} /> История
            </h2>
            <button onClick={() => setShowHistory(false)} className="md:hidden p-1 text-gray-500 rounded"><X size={18} /></button>
         </div>
         <div className="p-3">
            <button onClick={() => { onNewSession(); setShowHistory(false); }} className="w-full flex items-center justify-center space-x-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"><Plus size={16} /><span>Новый чат</span></button>
         </div>
         <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {sessions.map(session => (
              <div key={session.id} onClick={() => { onSelectSession(session.id); setShowHistory(false); }} className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm transition-colors ${activeSessionId === session.id ? 'bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-[#3c3c3c]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2c]'}`}>
                <div className="truncate flex-1 font-medium">{session.title || 'Новый чат'}</div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#191919] relative">
       <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2f2f2f] flex items-center justify-between flex-shrink-0">
         <div className="flex items-center gap-3">
           <button onClick={() => setShowHistory(true)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400"><Menu size={20} /></button>
           <button onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} className="hidden md:block p-2 -ml-2 mr-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] rounded-lg transition-colors"><PanelLeft size={20} /></button>
           <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{sessions.find(s => s.id === activeSessionId)?.title || 'Ассистент'}</h2>
         </div>
       </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <Sparkles size={48} className="mb-4" />
              <p className="text-lg font-bold">Чем я могу помочь?</p>
              <p className="text-sm">Анализ в реальном времени, управление задачами и заметками</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[92%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl leading-relaxed shadow-sm transition-colors text-base ${msg.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-none' : 'bg-white dark:bg-[#202020] border border-gray-100 dark:border-[#2f2f2f] text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                  <ReactMarkdown className="prose dark:prose-invert max-w-none">{msg.content}</ReactMarkdown>
                  {msg.image && (
                     <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                        <img src={`data:image/png;base64,${msg.image}`} alt="AI Generated" className="w-full h-auto" />
                     </div>
                  )}
                </div>
                {msg.role === 'model' && msg.content && (
                  <div className="mt-1.5 flex justify-start pl-2">
                    <button onClick={() => handleCopy(msg.content, msg.id)} className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${copiedId === msg.id ? 'text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2c2c2c]'}`}>
                      {copiedId === msg.id ? <><Check size={12} /><span>Скопировано</span></> : <><Copy size={12} /><span>Копировать</span></>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#202020] border border-gray-100 dark:border-[#2f2f2f] px-4 py-3 rounded-2xl rounded-bl-none flex items-center space-x-2 shadow-sm">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-sm text-gray-500 font-medium">Думаю...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-4 md:py-8 bg-white dark:bg-[#191919] border-t border-gray-100 dark:border-[#2f2f2f] flex-shrink-0 z-20 pb-20 md:pb-8">
            <form onSubmit={handleSubmit} className="relative max-w-2xl w-full mx-auto">
              {file && (
                <div className="absolute -top-12 left-0 bg-gray-100 dark:bg-[#2c2c2c] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#3c3c3c] flex items-center text-xs font-bold animate-in slide-in-from-bottom-2">
                  <FileText size={14} className="mr-2 text-blue-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="ml-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
              )}
              <div className="relative flex items-center bg-gray-100 dark:bg-[#2c2c2c] rounded-full p-1.5 border border-transparent focus-within:border-gray-300 dark:focus-within:border-[#3f3f3f] focus-within:bg-white dark:focus-within:bg-[#202020] transition-all shadow-sm">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full transition-colors"><Paperclip size={18} /><input type="file" ref={fileInputRef} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} /></button>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Спросите о задачах или заметках..." className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white px-3 text-base" />
                <button type="submit" disabled={(!input.trim() && !file) || isProcessing} className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black disabled:opacity-10 transition-all shadow-md active:scale-90"><ArrowUp size={18} /></button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
