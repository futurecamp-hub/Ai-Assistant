
import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Search, FileText, X, Trash2, Download } from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteDate, setEditingNoteDate] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNoteId(note.id);
      setEditingNoteDate(note.date);
      setNewNoteTitle(note.title);
      setNewNoteContent(note.content);
    } else {
      setEditingNoteId(null);
      setEditingNoteDate('');
      setNewNoteTitle('');
      setNewNoteContent('');
    }
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (editingNoteId && window.confirm('Удалить эту заметку?')) {
      onDeleteNote(editingNoteId);
      setIsModalOpen(false);
    }
  };

  const handleExportNote = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `${note.title}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    if (editingNoteId) {
      onUpdateNote({
        id: editingNoteId,
        date: editingNoteDate,
        title: newNoteTitle.trim() || 'Без названия',
        content: newNoteContent.trim()
      });
    } else {
      onAddNote({
        title: newNoteTitle.trim() || 'Без названия',
        content: newNoteContent.trim()
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919] transition-colors duration-200 relative">
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Заметки</h1>
          <button onClick={() => handleOpenModal()} className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-sm"><Plus size={24} /></button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Поиск заметок..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-100 dark:bg-[#2c2c2c] rounded-xl py-3 pl-10 pr-4 text-sm outline-none dark:text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
              <div key={note.id} onClick={() => handleOpenModal(note)} className="bg-gray-50 dark:bg-[#202020] rounded-2xl border border-gray-100 dark:border-[#2f2f2f] flex flex-col overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2 truncate">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-5 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="px-5 py-3 text-[10px] text-gray-400 border-t border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center">
                  <span>{new Date(note.date).toLocaleDateString('ru-RU')}</span>
                  <div className="flex space-x-2">
                    <button onClick={(e) => handleExportNote(e, note)} className="p-1 hover:text-blue-500"><Download size={14} /></button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-2xl rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center">
                <input type="text" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Название..." className="text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white w-full" autoFocus />
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-1"><X size={24} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4">
                <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Текст заметки..." className="w-full h-full min-h-[350px] bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 leading-relaxed" />
             </div>
             <div className="p-4 border-t border-gray-100 dark:border-[#2f2f2f] flex justify-between items-center bg-gray-50 dark:bg-[#202020] rounded-b-3xl">
                <div>
                   {editingNoteId && <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={20} /></button>}
                </div>
                <button onClick={handleSubmit} className="bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity">Сохранить</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NotesView;
