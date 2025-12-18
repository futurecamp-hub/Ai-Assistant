
import React, { useState, useEffect } from 'react';
import { Shield, Zap, PlayCircle, Key, ExternalLink, Loader2, Lock } from 'lucide-react';
import { openApiKeySelector, hasValidKey } from '../services/ai';

interface OnboardingModalProps {
  onComplete: () => void;
  onEnableSimMode: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onEnableSimMode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isOpeningDialog, setIsOpeningDialog] = useState(false);

  useEffect(() => {
    hasValidKey().then(exists => {
      if (exists) {
        onComplete();
      }
      setIsChecking(false);
    });
  }, [onComplete]);

  const handleConnectKey = async () => {
    setIsOpeningDialog(true);
    try {
      const success = await openApiKeySelector();
      // Assume success as per guidelines for the race condition
      onComplete();
    } catch (e) {
      console.error("Selection failed", e);
      setIsOpeningDialog(false);
    }
  };

  if (isChecking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white dark:bg-[#0f0f0f] transition-colors duration-500" />
      
      <div className="relative bg-white dark:bg-[#191919] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-[#2f2f2f] animate-in fade-in zoom-in duration-500 flex flex-col">
        
        <div className="bg-gray-50 dark:bg-[#202020] px-8 py-10 text-center border-b border-gray-100 dark:border-[#2f2f2f]">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white dark:text-black">
             <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">BizMate AI</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Ваше новое рабочее пространство</p>
        </div>

        <div className="p-10 space-y-8">
           <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#202020] border border-gray-100 dark:border-[#2f2f2f]">
                 <Lock size={18} className="text-indigo-500" />
                 <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                   Ключ подключается через защищенный системный диалог Google и не покидает ваш браузер.
                 </p>
              </div>

              {/* Кнопка подключения (открывает диалог) */}
              <button 
                onClick={handleConnectKey}
                disabled={isOpeningDialog}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-widest"
              >
                {isOpeningDialog ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                <span>ПОДКЛЮЧИТЬ GEMINI API</span>
              </button>

              {/* Ссылка на получение ключа */}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-gray-100 dark:bg-[#2c2c2c] text-gray-600 dark:text-gray-400 py-4 rounded-2xl font-black flex items-center justify-center space-x-2 border border-transparent hover:bg-gray-200 dark:hover:bg-[#363636] transition-all text-[11px] uppercase tracking-[0.15em]"
              >
                <ExternalLink size={14} />
                <span>Где взять API ключ?</span>
              </a>
           </div>

           <button 
            onClick={() => { onEnableSimMode(); onComplete(); }}
            className="w-full text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Войти в демо-режим (без ИИ)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
