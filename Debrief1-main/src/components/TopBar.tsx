import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, LogOut, Plus, Key, Menu, Copy, CheckCheck, Trash2 } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { Route } from '../types';

const ROUTE_LABELS: Record<Route, string> = {
  all: 'All Meetings',
  action: 'Action Items',
  decision: 'Decisions',
  discussion: 'Discussion',
  problem: 'Problems',
  settings: 'Settings',
};

interface TopBarProps {
  onSearch: (q: string) => void;
  onOpenWorkspaceModal: (mode: 'create' | 'join') => void;
  onToggleSidebar: () => void;
}

import { useRoom } from '../context/RoomContext';

export const TopBar: React.FC<TopBarProps> = ({ onSearch, onOpenWorkspaceModal, onToggleSidebar }) => {
  const { route } = useRouter();
  const { activeRoom, setActiveRoom, rooms, leaveRoom, deleteRoom } = useRoom();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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
    <header className="fixed top-0 left-0 md:left-60 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-30">
      <div className="flex items-center gap-2 md:gap-3 text-sm min-w-0">
        {/* Mobile hamburger menu */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative min-w-0" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 -ml-1.5 md:-ml-2 rounded-md hover:bg-gray-100 transition-colors group min-w-0"
            title="Switch Workspace"
          >
            <span className="text-gray-400 font-medium group-hover:text-gray-600 transition-colors truncate max-w-[100px] sm:max-w-[180px]">
              {activeRoom ? activeRoom.name : 'Select Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              {/* Invite code banner - always visible when a room is active */}
              {activeRoom && (
                <div className="mx-3 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Invite Code</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-gray-900 tracking-widest select-all">
                      {activeRoom.inviteCode}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await navigator.clipboard.writeText(activeRoom.inviteCode);
                          setCodeCopied(true);
                          setTimeout(() => setCodeCopied(false), 2000);
                        } catch {
                          // Fallback: select the text
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                        codeCopied
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 active:scale-95'
                      }`}
                    >
                      {codeCopied ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Share this code to invite teammates</p>
                </div>
              )}

              <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Workspaces</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {rooms.map(room => (
                  <div key={room.id} className="flex flex-col">
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 group/item">
                      <button 
                        onClick={() => { setActiveRoom(room); setIsDropdownOpen(false); setConfirmDeleteId(null); }}
                        className="flex-1 flex items-center gap-2 text-left px-2 py-1.5 rounded-lg text-sm text-gray-700 font-medium"
                      >
                        {activeRoom?.id === room.id ? <Check size={14} className="text-gray-900" /> : <span className="w-[14px]"></span>}
                        <span className="truncate">{room.name}</span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(confirmDeleteId === room.id ? null : room.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover/item:opacity-100 transition-all"
                          title="Delete Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); leaveRoom(room.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover/item:opacity-100 transition-all"
                          title="Leave Workspace"
                        >
                          <LogOut size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Delete confirmation inline */}
                    {confirmDeleteId === room.id && (
                      <div className="mx-3 mb-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-[11px] text-red-700 font-medium mb-2">Delete "{room.name}"? This removes all notes, messages, and members.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await deleteRoom(room.id);
                                setConfirmDeleteId(null);
                              } catch (err: any) {
                                alert(err.response?.data?.error || 'Failed to delete. You must be an admin.');
                              }
                            }}
                            className="flex-1 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-md hover:bg-red-700 transition-colors"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="flex-1 py-1.5 bg-white text-gray-600 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
        <span className="text-gray-300 hidden sm:inline">/</span>
        <span className="font-semibold text-gray-800 hidden sm:inline">{ROUTE_LABELS[route]}</span>
        
        {activeRoom && (
          <div className="ml-2 md:ml-4 flex items-center gap-2 hidden sm:flex">
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              Code: {activeRoom.inviteCode}
            </span>
          </div>
        )}
      </div>

      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        <input
          type="text"
          placeholder="Search…"
          onChange={e => onSearch(e.target.value)}
          className="pl-8 pr-3 md:pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none w-28 sm:w-36 md:w-44 transition-all placeholder:text-gray-400"
        />
      </div>
    </header>
  );
};
