import React from 'react';
import { useNotes } from '../context/NotesContext';
import { CheckCircle, Gavel, AlertCircle, MessageSquare, FileText } from 'lucide-react';

const items = [
  { key: 'all', label: 'Total Notes', shortLabel: 'Total', icon: <FileText size={13} />, color: 'text-gray-600', bg: 'bg-gray-50' },
  { key: 'action', label: 'Action Items', shortLabel: 'Actions', icon: <CheckCircle size={13} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'decision', label: 'Decisions', shortLabel: 'Decisions', icon: <Gavel size={13} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'problem', label: 'Problems', shortLabel: 'Problems', icon: <AlertCircle size={13} />, color: 'text-red-500', bg: 'bg-red-50' },
  { key: 'discussion', label: 'Discussions', shortLabel: 'Discuss', icon: <MessageSquare size={13} />, color: 'text-violet-600', bg: 'bg-violet-50' },
] as const;

export const SummaryPanel: React.FC = () => {
  const { notes } = useNotes();

  const countFor = (key: string) =>
    key === 'all' ? notes.length : notes.filter(n => n.category === key).length;

  return (
    <>
      {/* Mobile: horizontal scroll strip */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {items.map(item => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-2 rounded-lg flex-shrink-0"
          >
            <span className={`${item.color} ${item.bg} p-1 rounded`}>{item.icon}</span>
            <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">{item.shortLabel}</span>
            <span className={`text-xs font-bold ${item.color}`}>{countFor(item.key)}</span>
          </div>
        ))}
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className="w-56 hidden lg:flex flex-col gap-2 sticky top-20 self-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Summary</p>
        {items.map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between bg-white border border-gray-100 px-3 py-2.5 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className={`${item.color} ${item.bg} p-1 rounded`}>{item.icon}</span>
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
            </div>
            <span className={`text-xs font-bold ${item.color}`}>{countFor(item.key)}</span>
          </div>
        ))}
      </aside>
    </>
  );
};
