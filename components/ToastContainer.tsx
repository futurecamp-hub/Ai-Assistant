
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div className="pointer-events-auto flex items-center p-4 mb-1 min-w-[300px] bg-white dark:bg-[#202020] border border-gray-100 dark:border-[#3c3c3c] rounded-xl shadow-lg shadow-black/5 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex-shrink-0 mr-3 ${
        toast.type === 'success' ? 'text-green-500' :
        toast.type === 'error' ? 'text-red-500' :
        'text-blue-500'
      }`}>
        {toast.type === 'success' && <CheckCircle size={20} />}
        {toast.type === 'error' && <XCircle size={20} />}
        {toast.type === 'info' && <Info size={20} />}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {toast.message}
      </div>
      <button 
        onClick={() => removeToast(toast.id)}
        className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;
