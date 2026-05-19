import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface RoomContextValue {
  rooms: Room[];
  activeRoom: Room | null;
  setActiveRoom: (room: Room | null) => void;
  isLoadingRooms: boolean;
  createRoom: (name: string, description?: string) => Promise<Room>;
  joinRoom: (inviteCode: string) => Promise<Room>;
  leaveRoom: (roomId: number) => Promise<void>;
  fetchRooms: () => Promise<void>;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(() => {
    try {
      const saved = localStorage.getItem('debrief_active_room');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingRooms(true);
      const res = await api.get('/rooms');
      setRooms(res.data.rooms || []);
      
      // If activeRoom is no longer in the list (e.g. kicked or deleted), clear it
      if (activeRoom) {
        const stillExists = res.data.rooms.find((r: Room) => r.id === activeRoom.id);
        if (!stillExists) {
          setActiveRoom(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user, activeRoom]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    } else {
      setRooms([]);
      setActiveRoom(null);
    }
  }, [user, fetchRooms]);

  useEffect(() => {
    if (activeRoom) {
      localStorage.setItem('debrief_active_room', JSON.stringify(activeRoom));
    } else {
      localStorage.removeItem('debrief_active_room');
    }
  }, [activeRoom]);

  const createRoom = async (name: string, description?: string) => {
    const res = await api.post('/rooms', { name, description });
    const newRoom = res.data.room;
    setRooms(prev => [...prev, newRoom]);
    setActiveRoom(newRoom);
    return newRoom;
  };

  const joinRoom = async (inviteCode: string) => {
    const res = await api.post('/rooms/join', { inviteCode });
    const joinedRoom = res.data.room;
    
    // Check if already in rooms list
    setRooms(prev => {
      const exists = prev.find(r => r.id === joinedRoom.id);
      if (exists) return prev;
      return [...prev, joinedRoom];
    });
    
    setActiveRoom(joinedRoom);
    return joinedRoom;
  };

  const leaveRoom = async (roomId: number) => {
    await api.delete(`/rooms/${roomId}/leave`);
    setRooms(prev => prev.filter(r => r.id !== roomId));
    if (activeRoom && activeRoom.id === roomId) {
      setActiveRoom(null);
    }
  };

  return (
    <RoomContext.Provider value={{ rooms, activeRoom, setActiveRoom, isLoadingRooms, createRoom, joinRoom, leaveRoom, fetchRooms }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
};
