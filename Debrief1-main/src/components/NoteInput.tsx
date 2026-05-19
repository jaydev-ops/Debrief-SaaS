import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotes } from '../context/NotesContext';

interface NoteInputProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: number; // Optional roomId if we're in a room
  meetingId?: number; // Optional meetingId
}

export const NoteInput: React.FC<NoteInputProps> = ({ isOpen, onClose, roomId, meetingId }) => {
  const { addNote } = useNotes();
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => textAreaRef.current?.focus(), 80);
  }, [isOpen]);

  const handleSave = async () => {
    if (!content.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      // Delegate everything to NotesContext which handles optimistic UI & POST /notes
      await addNote(content, meetingId, roomId);
      setContent('');
      onClose();
    } catch (err) {
      console.error("Error saving note", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-gray-900" size={16} />
                <h3 className="font-semibold text-gray-900 text-sm">New smart note</h3>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <textarea
                ref={textAreaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'What happened in the meeting?\n\n"Sarah will fix the UI bug by Friday"\n"We decided to use AWS"\n"Production latency is spiking"'}
                className="w-full h-36 bg-transparent text-gray-900 placeholder:text-gray-400 resize-none outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                AI will auto-categorize
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 hidden sm:block">⌘ + Enter</span>
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || isProcessing}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                >
                  {isProcessing ? (
                    <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  ) : (
                    <><Send size={13} /> Save Note</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
