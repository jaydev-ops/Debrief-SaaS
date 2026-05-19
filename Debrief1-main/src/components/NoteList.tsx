import React from 'react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';
import { motion, AnimatePresence } from 'motion/react';
import { FileText } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  emptyMessage?: string;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, emptyMessage = 'No notes yet.' }) => {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-600 mb-1">Nothing here yet</p>
        <p className="text-xs text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {notes.map(note => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <NoteCard note={note} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
