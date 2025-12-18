
import React, { useState, useRef, useEffect } from 'react';
import { SystemStructure, SystemElement, ChatMessage } from '../types';
import { Hammer, Send, Database, File, Layout, ArrowRight, Loader2, Sparkles, Box } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getGeminiClient, constructorModelConfig } from '../services/ai';
import { Chat } from '@google/genai';

interface ConstructorViewProps {
  // We manage local session for the constructor to keep context separate
}

const ConstructorView: React.FC<ConstructorViewProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStructure, setActiveStructure] = useState<SystemStructure | null>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize specific constructor chat session
    const client = getGeminiClient();
    chatSessionRef.current = client.chats.create(constructorModelConfig);

    // Initial Welcome Message
    setMessages([{
      id: 'init',
      role: 'model',
      content: 'Привет! Я модуль **Конструктор**. \n\nЯ не просто чат — я архитектор рабочих пространств. Опишите, какую систему вы хотите построить (например: "CRM для агентства недвижимости", "Трекер личных финансов", "Система найма сотрудников"), и я спроектирую для вас структуру страниц и баз данных.',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      let response = await chatSessionRef.current.sendMessage({
        message: input
      });

      let functionCalls = response.functionCalls;
      let newStructure: SystemStructure | null = null;

      // Handle the constructor tool
      if (functionCalls && functionCalls.length > 0) {
        const responses = [];
        for (const call of functionCalls) {
           if (call.name === 'proposeSystemStructure') {
              newStructure = call.args as unknown as SystemStructure;
              setActiveStructure(newStructure);
              
              responses.push({
                name: call.name,
                response: { result: { success: true, message: "Structure visualized in UI." } },
                id: call.id
              });
           }
        }
        
        // Send back tool results to get the final text explanation
        if (responses.length > 0) {
             // Fixed: Included `id` property in functionResponse as required by SDK
             const toolResponseParts = responses.map(tr => ({
                functionResponse: { name: tr.name, response: tr.response, id: tr.id }
              }));
             response = await chatSessionRef.current.sendMessage({ message: toolResponseParts });
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "Структура обновлена.",
        timestamp: new Date(),
        systemStructure: newStructure || undefined
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Constructor Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Произошла ошибка при проектировании. Попробуйте еще раз или перефразируйте запрос.",
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStructureElement = (el: SystemElement, depth = 0) => (
    <div key={el.id} className="mb-2">
      <div 
        className={`flex items-start p-3 rounded-lg border transition-all ${
           el.type === 'database' 
             ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' 
             : el.type === 'dashboard'
             ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30'
             : 'bg-white dark:bg-[#2c2c2c] border-gray-200 dark:border-[#3c3c3c]'
        }`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className={`mr-3 mt-1 ${
           el.type === 'database' ? 'text-blue-500' : el.type === 'dashboard' ? 'text-purple-500' : 'text-gray-400'
        }`}>
          {el.type === 'database' ? <Database size={18} /> : el.type === 'dashboard' ? <Layout size={18} /> : <File size={18} />}
        </div>
        <div className="flex-1">
           <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{el.title}</span>
              <span className="text-[10px] uppercase bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-medium">
                {el.type}
              </span>
           </div>
           {el.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{el.description}</p>}
           
           {(el.properties || el.views) && (
             <div className="mt-2 flex flex-wrap gap-1">
                {el.views?.map((v, i) => (
                   <span key={`v-${i}`} className="text-[10px] px-1.5 border border-gray-200 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20">
                     👁️ {v}
                   </span>
                ))}
                {el.properties?.map((p, i) => (
                   <span key={`p-${i}`} className="text-[10px] px-1.5 border border-gray-200 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20">
                     {p}
                   </span>
                ))}
             </div>
           )}
        </div>
      </div>
      {el.children && el.children.map(child => renderStructureElement(child, depth + 1))}
    </div>
  );

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#191919] overflow-hidden">
      
      {/* Left Panel: Chat Interface */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-[#2f2f2f] min-w-[350px]">
         <div className="p-4 border-b border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#191919] flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
               <Hammer size={20} />
            </div>
            <div>
               <h2 className="font-bold text-gray-900 dark:text-gray-100">Конструктор</h2>
               <p className="text-xs text-gray-500 dark:text-gray-400">Архитектор систем Notion</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#191919]">
            {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-none' 
                      : 'bg-gray-100 dark:bg-[#2c2c2c] text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}>
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
               </div>
            ))}
             {isProcessing && (
               <div className="flex items-center space-x-2 text-gray-400 text-sm p-2">
                 <Loader2 size={16} className="animate-spin" />
                 <span>Проектирую структуру...</span>
               </div>
             )}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-4 bg-white dark:bg-[#191919] border-t border-gray-200 dark:border-[#2f2f2f]">
            <form onSubmit={handleSendMessage} className="relative">
               <input 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Например: Сделай систему управления проектами..."
                 className="w-full bg-gray-50 dark:bg-[#2c2c2c] border border-transparent focus:bg-white dark:focus:bg-[#202020] focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3 outline-none transition-all dark:text-white"
                 disabled={isProcessing}
               />
               <button 
                 type="submit" 
                 disabled={!input.trim() || isProcessing}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <Send size={16} />
               </button>
            </form>
         </div>
      </div>

      {/* Right Panel: Blueprint Visualization */}
      <div className="hidden lg:flex w-[450px] flex-col bg-gray-50 dark:bg-[#151515] border-l border-gray-200 dark:border-[#2f2f2f]">
         <div className="p-4 border-b border-gray-200 dark:border-[#2f2f2f] flex justify-between items-center bg-white dark:bg-[#191919]">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center">
               <Layout size={18} className="mr-2" />
               Структура системы
            </h3>
            {activeStructure && (
               <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                  Active
               </span>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-6">
            {!activeStructure ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                  <Box size={48} className="mb-4 opacity-20" />
                  <p className="font-medium text-gray-500 dark:text-gray-500">Чертеж пуст</p>
                  <p className="text-sm mt-2">Опишите задачу в чате, и здесь появится архитектура вашего приложения.</p>
               </div>
            ) : (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-[#2f2f2f]">
                     {activeStructure.title}
                  </h2>
                  <div className="space-y-4">
                     {activeStructure.elements.map(el => renderStructureElement(el))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl">
                     <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-1">Совет архитектора</h4>
                     <p className="text-xs text-yellow-700 dark:text-yellow-600">
                        Вы можете попросить меня изменить эту структуру: добавить новые связи, свойства или создать шаблоны для баз данных. Просто напишите в чат.
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ConstructorView;
