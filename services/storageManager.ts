
import { Task, CalendarEvent, Note, ChatSession, MarketBriefing } from '../types';

const STORAGE_KEYS = {
  TASKS: 'bizmate_tasks', 
  NOTES: 'bizmate_notes',
  SESSIONS: 'bizmate_chat_sessions',
  BRIEFING: 'bizmate_market_briefing',
  REPORT: 'bizmate_detailed_report',
  THEME: 'bizmate_theme',
  SIM_MODE: 'bizmate_sim_mode',
  CUSTOM_KEY: 'bizmate_custom_api_key'
};

export interface WorkspaceBackup {
  version: number;
  timestamp: number;
  data: {
    [key: string]: any;
  };
}

// Helper to get size of string in bytes
const strSize = (str: string) => new Blob([str]).size;

export const getStorageUsage = () => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('bizmate_')) {
      total += strSize(localStorage.getItem(key) || '');
    }
  }
  return total;
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const exportWorkspace = () => {
  const data: { [key: string]: any } = {};
  
  // Collect all bizmate related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bizmate_')) {
      try {
        const value = localStorage.getItem(key);
        // Try parsing JSON to keep the file clean, otherwise store string
        data[key] = value ? JSON.parse(value) : null;
      } catch (e) {
        // Fallback for non-JSON strings
        data[key] = localStorage.getItem(key);
      }
    }
  }

  const backup: WorkspaceBackup = {
    version: 1,
    timestamp: Date.now(),
    data: data
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `bizmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// New function: Reads and parses the file, but DOES NOT write to localStorage.
// It returns the normalized data object so the React App can update its state directly.
export const parseBackupFile = async (file: File): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let backup: any;
        
        try {
            backup = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error('Файл не является валидным JSON.');
        }

        if (!backup || typeof backup !== 'object') {
             throw new Error('Некорректная структура файла.');
        }

        // Determine where the actual data lives
        const rawData = backup.data || backup;
        const normalizedData: Record<string, any> = {};
        
        console.log("Parsing Backup. Keys found:", Object.keys(rawData));

        // Mapping legacy keys to standard keys
        const KEY_MAP: { [key: string]: string } = {
          'tasks': 'bizmate_tasks',
          'events': 'bizmate_events',
          'notes': 'bizmate_notes',
          'sessions': 'bizmate_chat_sessions',
          'chat_sessions': 'bizmate_chat_sessions',
          'theme': 'bizmate_theme',
          'market_briefing': 'bizmate_market_briefing',
          'briefing': 'bizmate_market_briefing',
          'detailed_report': 'bizmate_detailed_report',
          'sim_mode': 'bizmate_sim_mode',
          'custom_api_key': 'bizmate_custom_api_key'
        };
        
        for (const [key, value] of Object.entries(rawData)) {
             if (key === 'version' || key === 'timestamp') continue;
             
             let targetKey = key;
             // If key doesn't start with bizmate_, try to map it
             if (!key.startsWith('bizmate_')) {
                 if (KEY_MAP[key]) {
                     targetKey = KEY_MAP[key];
                 } else {
                     targetKey = `bizmate_${key}`; // Fallback
                 }
             }

             if (value !== undefined && value !== null) {
                 normalizedData[targetKey] = value;
             }
        }

        resolve(normalizedData);
      } catch (err) {
        console.error('Parse failed:', err);
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsText(file);
  });
};

/**
 * @deprecated Use parseBackupFile and update React state instead.
 */
export const importWorkspace = async (file: File): Promise<number> => {
    const data = await parseBackupFile(file);
    let count = 0;
    Object.entries(data).forEach(([key, value]) => {
         localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
         count++;
    });
    return count;
}
