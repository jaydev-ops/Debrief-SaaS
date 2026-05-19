import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, LogOut, Plus, Key } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { Route } from '../types';

const ROUTE_LABELS: Record<Route, string> = {
  all: 'All Meetings',
  action: 'Action Items',
  decision: 'Decisions',
  discussion: 'Discussion',
  problem: 'Problems',
};

interface TopBarProps {
  onSearch: (q: string) => void;
  onOpenWorkspaceModal: (mode: 'create' | 'join') => void;
}

import { useRoom } from '../context/RoomContext';

export const TopBar: React.FC<TopBarProps> = ({ onSearch, onOpenWorkspaceModal }) => {
  const { route } = useRouter();
  const { activeRoom, setActiveRoom, rooms, leaveRoom } = useRoom();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-3 text-sm">
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-md hover:bg-gray-100 transition-colors group"
            title="Switch Workspace"
          >
            <span className="text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
              {activeRoom ? activeRoom.name : 'Select Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Workspaces</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {rooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 group/item">
                    <button 
                      onClick={() => { setActiveRoom(room); setIsDropdownOpen(false); }}
                      className="flex-1 flex items-center gap-2 text-left px-2 py-1.5 rounded-lg text-sm text-gray-700 font-medium"
                    >
                      {activeRoom?.id === room.id ? <Check size={14} className="text-gray-900" /> : <span className="w-[14px]"></span>}
                      <span className="truncate">{room.name}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); leaveRoom(room.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover/item:opacity-100 transition-all"
                      title="Leave Workspace"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-2 pt-2 mt-2 border-t border-gray-100 space-y-1">
                <button 
                  onClick={() => { onOpenWorkspaceModal('create'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Create New Workspace
                </button>
                <button 
                  onClick={() => { onOpenWorkspaceModal('join'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Key size={14} /> Join via Code
                </button>
              </div>
            </div>
          )}
        </div>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{ROUTE_LABELS[route]}</span>
        
        {activeRoom && (
          <div className="ml-4 flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              Code: {activeRoom.inviteCode}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        <input
          type="text"
          placeholder="Search notes…"
          onChange={e => onSearch(e.target.value)}
          className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none w-44 transition-all placeholder:text-gray-400"
        />
      </div>
    </header>
  );
};
