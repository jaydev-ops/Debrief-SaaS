import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Note, NoteCategory } from '../types';
import api from '../services/api';
import { syncQueue } from '../services/syncQueue';
import { useRoom } from './RoomContext';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

interface NotesContextValue {
  notes: Note[];
  syncStatus: SyncStatus;
  addNote: (content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getByCategory: (category: NoteCategory) => Note[];
}

const NotesContext = createContext<NotesContextValue | null>(null);

const CACHE_KEY = 'debrief_notes_cache';

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const { activeRoom } = useRoom();

  useEffect(() => {
    // Initial load for active room
    const fetchNotes = async () => {
      if (!activeRoom) {
        setNotes([]);
        return;
      }
      try {
        setSyncStatus('syncing');
        const res = await api.get('/notes', { params: { roomId: activeRoom.id } });
        const fetchedNotes = res.data.notes || [];
        // Map backend 'type' to frontend 'category'
        const mappedNotes = fetchedNotes.map((n: any) => ({
          ...n,
          category: n.category || n.type || 'discussion',
          author: typeof n.author === 'object' && n.author ? n.author.name : n.author
        }));
        setNotes(mappedNotes);
        localStorage.setItem(CACHE_KEY, JSON.stringify(mappedNotes));
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to fetch notes, using cache.', error);
        setSyncStatus('offline');
      }
    };
    fetchNotes();
  }, [activeRoom]);

  const addNote = useCallback(async (content: string) => {
    if (!activeRoom) return;
    const tempId = crypto.randomUUID();
    
    // 1. Optimistic local update
    const optimisticNote: Note = {
      id: tempId,
      content,
      category: 'discussion', // temp default
      title: 'Syncing...',
      createdAt: Date.now(),
      syncStatus: 'pending',
      meetingId: 1, // Fallback for MVP if needed by DB constraints
      roomId: activeRoom.id
    };
    
    setNotes(prev => [optimisticNote, ...prev]);
    setSyncStatus('syncing');

    try {
      // 2. Call POST /notes
      const res = await api.post('/notes', { content, meetingId: 1, roomId: activeRoom.id });
      const createdNote = res.data.note;
      
      // 3. Replace temp note with real one
      setNotes(prev => prev.map(n => n.id === tempId ? { 
        ...createdNote, 
        category: createdNote.category || createdNote.type || 'discussion', 
        author: typeof createdNote.author === 'object' && createdNote.author ? createdNote.author.name : createdNote.author,
        syncStatus: 'synced' 
      } : n));
      setSyncStatus('synced');
      
      // Update cache
      setNotes(prev => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(prev));
        return prev;
      });
    } catch (error) {
      console.error('Failed to save note to server', error);
      setSyncStatus('offline');
      
      // 4. If offline: add to syncQueue
      await syncQueue.enqueue({
        id: tempId,
        type: 'CREATE_NOTE',
        payload: { content, meetingId: 1, roomId: activeRoom.id },
        timestamp: Date.now()
      });
      // Keep optimistic note but marked as offline
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, syncStatus: 'error' } : n));
    }
  }, [activeRoom]);

  const deleteNote = useCallback(async (id: string) => {
    // Optimistically remove
    const backup = notes;
    setNotes(prev => prev.filter(n => n.id !== id));
    
    try {
      await api.delete(`/notes/${id}`);
      // Update cache
      setNotes(prev => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(prev));
        return prev;
      });
    } catch (error) {
      console.error('Failed to delete note', error);
      // Revert if failed and online, or queue if offline
      setNotes(backup);
      await syncQueue.enqueue({
        id: crypto.randomUUID(),
        type: 'DELETE_NOTE',
        payload: { id },
        timestamp: Date.now()
      });
      setNotes(prev => prev.filter(n => n.id !== id)); // Remove anyway locally
    }
  }, [notes]);

  const getByCategory = useCallback((category: NoteCategory) => {
    return notes.filter(n => n.category === category);
  }, [notes]);

  return (
    <NotesContext.Provider value={{ notes, syncStatus, addNote, deleteNote, getByCategory }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
};
