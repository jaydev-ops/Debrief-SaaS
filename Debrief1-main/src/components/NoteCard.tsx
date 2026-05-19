import React, { useState } from 'react';
import { Note } from '../types';
import { Trash2, Share2, ChevronDown, ChevronUp, User, Clock, CheckCircle, Gavel, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useNotes } from '../context/NotesContext';

const CATEGORY_CONFIG = {
  action: {
    label: 'Action Item',
    bar: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: <CheckCircle size={11} />,
  },
  decision: {
    label: 'Decision',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: <Gavel size={11} />,
  },
  problem: {
    label: 'Problem',
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-100',
    icon: <AlertCircle size={11} />,
  },
  discussion: {
    label: 'Discussion',
    bar: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-100',
    icon: <MessageSquare size={11} />,
  },
};

const PRIORITY_CONFIG = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-gray-100 text-gray-500',
};

interface NoteCardProps {
  note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const { deleteNote } = useNotes();

  const cfg = CATEGORY_CONFIG[note.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['discussion'];
  const timeAgo = formatDistanceToNow(note.createdAt, { addSuffix: true });

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${note.title}\n\n${note.content}\n\nCategory: ${cfg.label} | ${timeAgo}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: note.title, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(note.id);
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={() => setExpanded(v => !v)}
    >
      {/* Top accent bar */}
      <div className={`h-0.5 ${cfg.bar}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              {cfg.icon}
              {cfg.label}
            </span>
            {note.priority && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[note.priority]}`}>
                {note.priority}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleShare}
              title={shareSuccess ? 'Copied!' : 'Share note'}
              className={`p-1.5 rounded-lg transition-all ${shareSuccess ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <Share2 size={13} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete note"
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} />
            </button>
            <div className="text-gray-300 ml-1">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1">
          {note.title || 'Untitled note'}
        </h4>

        {/* Preview (collapsed) */}
        {!expanded && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{note.content}</p>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-700 leading-relaxed mt-2 mb-3 whitespace-pre-wrap">
                {note.content}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                {note.assignee && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User size={11} className="text-gray-400" />
                    {note.assignee}
                  </span>
                )}
                {note.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} className="text-gray-400" />
                    Due {note.dueDate}
                  </span>
                )}
                {note.reportedBy && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User size={11} className="text-gray-400" />
                    Reported by {note.reportedBy}
                  </span>
                )}
                {note.author && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User size={11} className="text-gray-400" />
                    {note.author}
                  </span>
                )}
                {note.type && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    {note.type}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-gray-400">{timeAgo}</span>
          {note.category === 'discussion' && (
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              {note.votes != null && <span>↑ {note.votes}</span>}
              {note.replies != null && <span>💬 {note.replies}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
