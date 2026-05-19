import React, { useState, useRef, useEffect } from 'react';
import { Folder, CheckCircle, Gavel, MessageSquare, AlertCircle, Plus, LogOut, Settings, Trash2, MoreVertical } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import { Route } from '../types';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  route: Route;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <Folder size={16} />, label: 'All Meetings', route: 'all', color: 'text-gray-600' },
  { icon: <CheckCircle size={16} />, label: 'Action Items', route: 'action', color: 'text-blue-600' },
  { icon: <Gavel size={16} />, label: 'Decisions', route: 'decision', color: 'text-emerald-600' },
  { icon: <MessageSquare size={16} />, label: 'Discussion', route: 'discussion', color: 'text-violet-600' },
  { icon: <AlertCircle size={16} />, label: 'Problems', route: 'problem', color: 'text-red-500' },
];

interface SidebarProps {
  onNewNote: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewNote }) => {
  const { route, navigate } = useRouter();
  const { notes } = useNotes();
  const { user, logout, deleteAccount } = useAuth();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countFor = (r: Route) =>
    r === 'all' ? notes.length : notes.filter(n => n.category === r).length;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#FAFAF9] border-r border-gray-200 flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7.5h7M2 11h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900">Debrief</span>
        </div>
      </div>

      {/* New Note */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onNewNote}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={15} />
          New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-2 pb-1.5">
          Views
        </p>
        {NAV_ITEMS.map(item => {
          const isActive = route === item.route;
          const count = countFor(item.route);
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left group ${
                isActive
                  ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isActive ? 'bg-gray-100 text-gray-600' : 'text-gray-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100 relative" ref={profileDropdownRef}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1">
              <button 
                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('settings');
                }}
              >
                <Settings size={13} />
                Manage Account
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  deleteAccount();
                }}
              >
                <Trash2 size={13} />
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
